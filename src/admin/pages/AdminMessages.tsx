import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  CalendarDays,
  Eye,
  Inbox,
  LoaderCircle,
  Mail,
  MailCheck,
  Phone,
  RefreshCw,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deleteAdminMessage,
  getAdminMessage,
  getAdminMessages,
  updateAdminMessage,
  type AdminContactMessage,
} from "../../services/contact.service";

import "../style/admin-messages.css";

function formatMessageDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatMessageDateTime(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function formatLabel(value: string | undefined) {
  if (!value) {
    return "Not specified";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getStatusClass(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, "-");
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

function AdminMessages() {
  const navigate = useNavigate();
  const { messageId } = useParams<{
    messageId?: string;
  }>();

  const [messages, setMessages] = useState<
    AdminContactMessage[]
  >([]);

  const [totalMessages, setTotalMessages] =
    useState(0);

  const [selectedMessage, setSelectedMessage] =
    useState<AdminContactMessage | null>(null);

  const [messageToDelete, setMessageToDelete] =
    useState<AdminContactMessage | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isPreviewLoading, setIsPreviewLoading] =
    useState(false);

  const [isUpdatingMessage, setIsUpdatingMessage] =
    useState(false);

  const [isDeletingMessage, setIsDeletingMessage] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [previewError, setPreviewError] =
    useState<string | null>(null);

  const updateMessageInState = useCallback(
    (updatedMessage: AdminContactMessage) => {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === updatedMessage.id
            ? updatedMessage
            : message,
        ),
      );

      setSelectedMessage((currentMessage) =>
        currentMessage?.id === updatedMessage.id
          ? updatedMessage
          : currentMessage,
      );
    },
    [],
  );

  const markMessageAsRead = useCallback(
    async (
      message: AdminContactMessage,
    ): Promise<AdminContactMessage> => {
      if (message.status !== "NEW") {
        return message;
      }

      const updatedMessage =
        await updateAdminMessage(message.id, {
          status: "READ",
        });

      updateMessageInState(updatedMessage);

      return updatedMessage;
    },
    [updateMessageInState],
  );

  const openMessage = useCallback(
    async (id: number) => {
      try {
        setIsPreviewLoading(true);
        setPreviewError(null);

        const contactMessage =
          await getAdminMessage(id);

        const messageToDisplay =
          await markMessageAsRead(contactMessage);

        setSelectedMessage(messageToDisplay);
      } catch (openError: unknown) {
        setSelectedMessage(null);
        setPreviewError(
          getErrorMessage(openError),
        );
      } finally {
        setIsPreviewLoading(false);
      }
    },
    [markMessageAsRead],
  );

  const loadMessages = useCallback(
    async (showRefreshState = false) => {
      try {
        if (showRefreshState) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const response =
          await getAdminMessages();

        setMessages(response.data);
        setTotalMessages(
          response.pagination.total,
        );
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!messageId) {
      setSelectedMessage(null);
      setPreviewError(null);
      return;
    }

    const parsedMessageId =
      Number(messageId);

    if (
      !Number.isInteger(parsedMessageId) ||
      parsedMessageId <= 0
    ) {
      setPreviewError(
        "The message ID in the URL is invalid.",
      );
      return;
    }

    void openMessage(parsedMessageId);
  }, [messageId, openMessage]);

  useEffect(() => {
    if (
      !selectedMessage &&
      !messageToDelete &&
      !isPreviewLoading &&
      !previewError
    ) {
      return;
    }

    function handleEscapeKey(
      event: KeyboardEvent,
    ) {
      if (event.key !== "Escape") {
        return;
      }

      if (messageToDelete) {
        setMessageToDelete(null);
        return;
      }

      navigate("/admin/messages");
    }

    document.addEventListener(
      "keydown",
      handleEscapeKey,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, [
    isPreviewLoading,
    messageToDelete,
    navigate,
    previewError,
    selectedMessage,
  ]);

  const statistics = useMemo(() => {
    return {
      total: totalMessages,
      new: messages.filter(
        (message) =>
          message.status === "NEW",
      ).length,
      read: messages.filter(
        (message) =>
          message.status === "READ",
      ).length,
    };
  }, [messages, totalMessages]);

  function handleViewMessage(
    message: AdminContactMessage,
  ) {
    navigate(
      `/admin/messages/${message.id}`,
    );
  }

  function handleClosePreview() {
    setSelectedMessage(null);
    setPreviewError(null);
    navigate("/admin/messages");
  }

  async function handleMarkAsRead(
    message: AdminContactMessage,
  ) {
    if (message.status === "READ") {
      return;
    }

    try {
      setIsUpdatingMessage(true);
      setError(null);

      const updatedMessage =
        await updateAdminMessage(message.id, {
          status: "READ",
        });

      updateMessageInState(updatedMessage);
    } catch (updateError: unknown) {
      setError(
        getErrorMessage(updateError),
      );
    } finally {
      setIsUpdatingMessage(false);
    }
  }

  async function handleDeleteMessage() {
    if (!messageToDelete) {
      return;
    }

    try {
      setIsDeletingMessage(true);
      setError(null);

      await deleteAdminMessage(
        messageToDelete.id,
      );

      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) =>
            message.id !==
            messageToDelete.id,
        ),
      );

      setTotalMessages((currentTotal) =>
        Math.max(0, currentTotal - 1),
      );

      const deletedSelectedMessage =
        selectedMessage?.id ===
        messageToDelete.id;

      setMessageToDelete(null);

      if (deletedSelectedMessage) {
        setSelectedMessage(null);
        navigate("/admin/messages");
      }
    } catch (deleteError: unknown) {
      setError(
        getErrorMessage(deleteError),
      );
    } finally {
      setIsDeletingMessage(false);
    }
  }

  const showPreview =
    Boolean(messageId) ||
    Boolean(selectedMessage) ||
    isPreviewLoading ||
    Boolean(previewError);

  return (
    <section className="admin-messages">
      <div className="admin-messages__header">
        <div>
          <span className="admin-messages__eyebrow">
            Contact Inbox
          </span>

          <h1>Messages</h1>

          <p>
            Review contact form messages, mark
            them as read, or remove old requests.
          </p>
        </div>

        <button
          type="button"
          className="admin-messages__refresh-button"
          onClick={() =>
            void loadMessages(true)
          }
          disabled={
            isLoading || isRefreshing
          }
        >
          <RefreshCw
            size={17}
            className={
              isRefreshing
                ? "admin-messages__spinning-icon"
                : undefined
            }
          />

          <span>
            {isRefreshing
              ? "Refreshing..."
              : "Refresh"}
          </span>
        </button>
      </div>

      {error && !isLoading ? (
        <div className="admin-messages__alert">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      <div className="admin-messages__stats">
        <div className="admin-messages__stat-card">
          <span>Total Messages</span>
          <strong>
            {statistics.total}
          </strong>
        </div>

        <div className="admin-messages__stat-card">
          <span>New Messages</span>
          <strong>
            {statistics.new}
          </strong>
        </div>

        <div className="admin-messages__stat-card">
          <span>Read Messages</span>
          <strong>
            {statistics.read}
          </strong>
        </div>
      </div>

      <div className="admin-messages__table-card">
        <div className="admin-messages__table-header">
          <h2>Contact Messages</h2>

          <p>
            Messages submitted through the
            public contact form.
          </p>
        </div>

        {isLoading ? (
          <div className="admin-messages__state">
            <LoaderCircle
              size={34}
              className="admin-messages__spinning-icon"
            />

            <h3>Loading messages</h3>

            <p>
              Contacting the server and
              retrieving your inbox.
            </p>
          </div>
        ) : error && messages.length === 0 ? (
          <div className="admin-messages__state admin-messages__state--error">
            <AlertCircle size={34} />

            <h3>
              Messages could not be loaded
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                void loadMessages()
              }
            >
              Try again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="admin-messages__state">
            <Inbox size={34} />

            <h3>No contact messages yet</h3>

            <p>
              New messages submitted through
              the contact form will appear here.
            </p>
          </div>
        ) : (
          <div className="admin-messages__table-wrap">
            <table className="admin-messages__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>

                  <th className="admin-messages__actions-title">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {messages.map((message) => {
                  const statusClass =
                    getStatusClass(
                      message.status,
                    );

                  return (
                    <tr
                      key={message.id}
                      className={
                        message.status === "NEW"
                          ? "admin-messages__row--new"
                          : undefined
                      }
                    >
                      <td>
                        <strong>
                          {message.name}
                        </strong>
                      </td>

                      <td>
                        <a
                          className="admin-messages__email"
                          href={`mailto:${message.email}`}
                        >
                          {message.email}
                        </a>
                      </td>

                      <td>
                        {message.subject?.trim() ||
                          "No subject"}
                      </td>

                      <td>
                        {formatMessageDate(
                          message.createdAt,
                        )}
                      </td>

                      <td>
                        <span
                          className={`admin-messages__status admin-messages__status--${statusClass}`}
                        >
                          {formatLabel(
                            message.status,
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="admin-messages__actions">
                          <button
                            type="button"
                            title="View message"
                            aria-label={`View message from ${message.name}`}
                            onClick={() =>
                              handleViewMessage(
                                message,
                              )
                            }
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title={
                              message.status ===
                              "READ"
                                ? "Already read"
                                : "Mark as read"
                            }
                            aria-label={`Mark message from ${message.name} as read`}
                            disabled={
                              message.status ===
                                "READ" ||
                              isUpdatingMessage
                            }
                            onClick={() =>
                              void handleMarkAsRead(
                                message,
                              )
                            }
                          >
                            {isUpdatingMessage ? (
                              <LoaderCircle
                                size={16}
                                className="admin-messages__spinning-icon"
                              />
                            ) : (
                              <MailCheck
                                size={16}
                              />
                            )}
                          </button>

                          <button
                            type="button"
                            className="danger"
                            title="Delete message"
                            aria-label={`Delete message from ${message.name}`}
                            onClick={() =>
                              setMessageToDelete(
                                message,
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPreview ? (
        <div
          className="admin-messages__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleClosePreview();
            }
          }}
        >
          <div
            className="admin-messages__preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-preview-title"
          >
            <div className="admin-messages__preview-header">
              <div>
                <span>Contact Message</span>

                <h2 id="message-preview-title">
                  {selectedMessage?.subject?.trim() ||
                    "Message details"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-messages__modal-close"
                onClick={handleClosePreview}
                aria-label="Close message preview"
              >
                <X size={20} />
              </button>
            </div>

            {isPreviewLoading ? (
              <div className="admin-messages__preview-state">
                <LoaderCircle
                  size={36}
                  className="admin-messages__spinning-icon"
                />

                <h3>Opening message</h3>

                <p>
                  Retrieving the full message
                  details.
                </p>
              </div>
            ) : previewError ? (
              <div className="admin-messages__preview-state admin-messages__preview-state--error">
                <AlertCircle size={36} />

                <h3>
                  Message could not be opened
                </h3>

                <p>{previewError}</p>

                <button
                  type="button"
                  onClick={() => {
                    if (messageId) {
                      void openMessage(
                        Number(messageId),
                      );
                    }
                  }}
                >
                  Try again
                </button>
              </div>
            ) : selectedMessage ? (
              <>
                <div className="admin-messages__preview-content">
                  <div className="admin-messages__preview-details">
                    <div className="admin-messages__detail">
                      <div className="admin-messages__detail-icon">
                        <User size={17} />
                      </div>

                      <div>
                        <span>Name</span>
                        <strong>
                          {selectedMessage.name}
                        </strong>
                      </div>
                    </div>

                    <div className="admin-messages__detail">
                      <div className="admin-messages__detail-icon">
                        <Mail size={17} />
                      </div>

                      <div>
                        <span>Email</span>

                        <a
                          href={`mailto:${selectedMessage.email}`}
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>

                    <div className="admin-messages__detail">
                      <div className="admin-messages__detail-icon">
                        <Phone size={17} />
                      </div>

                      <div>
                        <span>Phone</span>

                        {selectedMessage.phone ? (
                          <a
                            href={`tel:${selectedMessage.phone}`}
                          >
                            {
                              selectedMessage.phone
                            }
                          </a>
                        ) : (
                          <strong>
                            Not provided
                          </strong>
                        )}
                      </div>
                    </div>

                    <div className="admin-messages__detail">
                      <div className="admin-messages__detail-icon">
                        <CalendarDays
                          size={17}
                        />
                      </div>

                      <div>
                        <span>Received</span>
                        <strong>
                          {formatMessageDateTime(
                            selectedMessage.createdAt,
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="admin-messages__preview-labels">
                    <div>
                      <span>Status</span>

                      <strong
                        className={`admin-messages__status admin-messages__status--${getStatusClass(
                          selectedMessage.status,
                        )}`}
                      >
                        {formatLabel(
                          selectedMessage.status,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Category</span>

                      <strong>
                        <Tag size={14} />

                        {formatLabel(
                          selectedMessage.category,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Priority</span>

                      <strong>
                        {formatLabel(
                          selectedMessage.priority,
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-messages__message-body">
                    <span>Message</span>

                    <p>
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="admin-messages__preview-footer">
                  <button
                    type="button"
                    className="admin-messages__secondary-button"
                    onClick={
                      handleClosePreview
                    }
                  >
                    Close
                  </button>

                  <div>
                    <button
                      type="button"
                      className="admin-messages__read-button"
                      disabled={
                        selectedMessage.status ===
                          "READ" ||
                        isUpdatingMessage
                      }
                      onClick={() =>
                        void handleMarkAsRead(
                          selectedMessage,
                        )
                      }
                    >
                      {isUpdatingMessage ? (
                        <LoaderCircle
                          size={17}
                          className="admin-messages__spinning-icon"
                        />
                      ) : (
                        <MailCheck size={17} />
                      )}

                      <span>
                        {selectedMessage.status ===
                        "READ"
                          ? "Message Read"
                          : "Mark as Read"}
                      </span>
                    </button>

                    <button
                      type="button"
                      className="admin-messages__delete-button"
                      onClick={() =>
                        setMessageToDelete(
                          selectedMessage,
                        )
                      }
                    >
                      <Trash2 size={17} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {messageToDelete ? (
        <div
          className="admin-messages__modal-backdrop admin-messages__modal-backdrop--confirmation"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget &&
              !isDeletingMessage
            ) {
              setMessageToDelete(null);
            }
          }}
        >
          <div
            className="admin-messages__confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-message-title"
          >
            <div className="admin-messages__confirm-icon">
              <Trash2 size={24} />
            </div>

            <h2 id="delete-message-title">
              Delete this message?
            </h2>

            <p>
              The message from{" "}
              <strong>
                {messageToDelete.name}
              </strong>{" "}
              will be permanently removed. This
              action cannot be undone.
            </p>

            <div className="admin-messages__confirm-actions">
              <button
                type="button"
                className="admin-messages__secondary-button"
                disabled={isDeletingMessage}
                onClick={() =>
                  setMessageToDelete(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-messages__delete-button"
                disabled={isDeletingMessage}
                onClick={() =>
                  void handleDeleteMessage()
                }
              >
                {isDeletingMessage ? (
                  <LoaderCircle
                    size={17}
                    className="admin-messages__spinning-icon"
                  />
                ) : (
                  <Trash2 size={17} />
                )}

                <span>
                  {isDeletingMessage
                    ? "Deleting..."
                    : "Delete Message"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminMessages;