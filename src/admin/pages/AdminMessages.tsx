import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive, ArrowLeft, Check, CheckCheck, ExternalLink, Inbox,
  LoaderCircle, Mail, RefreshCw, Search, Trash2, X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteAdminMessage, getAdminMessage, getAdminMessages,
  updateAdminMessage, type AdminContactMessage,
} from "../../services/contact.service";
import "../style/admin-messages.css";

type Filter = "ALL" | "NEW" | "READ" | "REPLIED" | "ARCHIVED";
const filters: Filter[] = ["ALL", "NEW", "READ", "REPLIED", "ARCHIVED"];
const dateText = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};
const titleText = (value?: string | null) => value?.trim() || "No subject";
const pretty = (value?: string | null) => value?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || "Not specified";
const errorText = (error: unknown) => error instanceof Error ? error.message : "Something went wrong. Please try again.";

function gmailReplyUrl(message: AdminContactMessage) {
  const subject = titleText(message.subject);
  const replySubject = /^re:/i.test(subject) ? subject : `Re: ${subject}`;
  const body = `\n\n--- Original message from ${message.name} ---\n${message.message}`;
  const params = new URLSearchParams({ view: "cm", fs: "1", to: message.email, su: replySubject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

export default function AdminMessages() {
  const navigate = useNavigate();
  const { messageId } = useParams<{ messageId?: string }>();
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<AdminContactMessage | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminContactMessage | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminMessages();
      setMessages(response.data);
      setTotal(response.pagination.total);
    } catch (err) { setError(errorText(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!messageId) { setSelected(null); setReading(false); return; }
    const id = Number(messageId);
    if (!Number.isSafeInteger(id) || id <= 0) { setError("Invalid message ID."); return; }
    let cancelled = false;
    setReading(true);
    setSelected(null);
    setError(null);
    (async () => {
      try {
        let item = await getAdminMessage(id);
        if (cancelled) return;
        if (item.status === "NEW") {
          try { item = await updateAdminMessage(id, { status: "READ" }); }
          catch { /* The message remains readable even if updating its status fails. */ }
        }
        if (!cancelled) {
          setSelected(item);
          setMessages(old => old.map(m => m.id === id ? item : m));
        }
      } catch (err) { if (!cancelled) setError(errorText(err)); }
      finally { if (!cancelled) setReading(false); }
    })();
    return () => { cancelled = true; };
  }, [messageId]);

  const visible = useMemo(() => messages.filter(m => {
    const matchesFilter = filter === "ALL" || m.status === filter;
    const haystack = [m.name, m.email, m.subject || "", m.message].join(" ").toLowerCase();
    return matchesFilter && haystack.includes(query.trim().toLowerCase());
  }), [messages, filter, query]);
  const count = (status: Filter) => status === "ALL" ? total : messages.filter(m => m.status === status).length;

  const changeStatus = async (item: AdminContactMessage, status: "READ" | "REPLIED" | "ARCHIVED") => {
    setBusy(true); setNotice(null); setError(null);
    try {
      const updated = await updateAdminMessage(item.id, { status });
      setMessages(old => old.map(m => m.id === updated.id ? updated : m));
      setSelected(old => old?.id === updated.id ? updated : old);
      setNotice(`Message marked as ${status.toLowerCase()}.`);
    } catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    setBusy(true); setError(null);
    try {
      await deleteAdminMessage(pendingDelete.id);
      setMessages(old => old.filter(m => m.id !== pendingDelete.id));
      setTotal(old => Math.max(0, old - 1));
      if (selected?.id === pendingDelete.id) navigate("/admin/messages");
      setPendingDelete(null);
      setNotice("Message deleted.");
    } catch (err) { setError(errorText(err)); }
    finally { setBusy(false); }
  };

  return (
    <section className="admin-messages">
      <header className="admin-messages__header">
        <div><span className="admin-messages__eyebrow">WATERFALL FESTIVAL / SUPPORT</span><h1>Messages</h1><p>Manage customer enquiries in one place.</p></div>
        <button className="admin-messages__button" onClick={() => void load()} disabled={loading}><RefreshCw size={17} className={loading ? "admin-messages__spin" : ""}/> Refresh</button>
      </header>

      {error && <div className="admin-messages__alert" role="alert">{error}<button aria-label="Dismiss error" onClick={() => setError(null)}><X size={16}/></button></div>}
      {notice && <div className="admin-messages__notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice(null)}><X size={16}/></button></div>}

      <div className="admin-messages__summary">
        <div><span>Total messages</span><strong>{total}</strong></div>
        <div><span>New</span><strong>{count("NEW")}</strong></div>
        <div><span>Read</span><strong>{count("READ")}</strong></div>
        <div><span>Replied</span><strong>{count("REPLIED")}</strong></div>
      </div>

      <div className="admin-messages__workspace">
        <div className="admin-messages__inbox">
          <div className="admin-messages__inbox-head"><div><h2>Contact inbox</h2><p>{visible.length} messages shown</p></div><span className="admin-messages__inbox-icon"><Inbox size={19}/></span></div>
          <label className="admin-messages__search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by sender, email or message…" aria-label="Search messages"/></label>
          <div className="admin-messages__tabs" aria-label="Filter messages">
            {filters.map(item => <button key={item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{pretty(item)} <span>{count(item)}</span></button>)}
          </div>
          {loading ? <div className="admin-messages__empty"><LoaderCircle className="admin-messages__spin" size={28}/>Loading messages…</div>
            : visible.length === 0 ? <div className="admin-messages__empty"><Inbox size={28}/><strong>No messages found</strong><span>Try another search or status filter.</span></div>
            : <div className="admin-messages__items">{visible.map(item => (
              <button key={item.id} className={`admin-messages__item ${item.status === "NEW" ? "is-new" : ""} ${selected?.id === item.id ? "is-selected" : ""}`} onClick={() => navigate(`/admin/messages/${item.id}`)}>
                <span className="admin-messages__avatar">{item.name.trim().charAt(0).toUpperCase() || "?"}</span>
                <span className="admin-messages__item-main"><span className="admin-messages__item-top"><strong>{item.name}</strong><time>{dateText(item.createdAt)}</time></span><span className="admin-messages__item-subject">{titleText(item.subject)}</span><span className="admin-messages__item-preview">{item.message}</span><span className={`admin-messages__status admin-messages__status--${item.status.toLowerCase()}`}>{pretty(item.status)}</span></span>
              </button>
            ))}</div>}
        </div>

        <div className="admin-messages__reader">
          {reading ? <div className="admin-messages__empty"><LoaderCircle className="admin-messages__spin" size={28}/>Opening message…</div>
            : selected ? <>
              <div className="admin-messages__reader-head"><div><span className="admin-messages__eyebrow">CUSTOMER ENQUIRY</span><h2>{titleText(selected.subject)}</h2><span className={`admin-messages__status admin-messages__status--${selected.status.toLowerCase()}`}>{pretty(selected.status)}</span></div><button className="admin-messages__icon-button" title="Close message" aria-label="Close message" onClick={() => navigate("/admin/messages")}><X size={20}/></button></div>
              <div className="admin-messages__reader-content">
                <div className="admin-messages__sender-card"><span className="admin-messages__avatar admin-messages__avatar--large">{selected.name.trim().charAt(0).toUpperCase() || "?"}</span><div><strong>{selected.name}</strong><a href={`mailto:${selected.email}`}>{selected.email}</a><small>Received {dateText(selected.createdAt)}</small></div></div>
                <div className="admin-messages__metadata"><div><span>Phone</span><strong>{selected.phone ? <a href={`tel:${selected.phone}`}>{selected.phone}</a> : "Not provided"}</strong></div><div><span>Category</span><strong>{pretty(selected.category)}</strong></div><div><span>Priority</span><strong>{pretty(selected.priority)}</strong></div></div>
                <div className="admin-messages__message"><span>MESSAGE</span><p>{selected.message}</p></div>
                <div className="admin-messages__reply"><div><Mail size={20}/><div><strong>Ready to reply?</strong><p>Open Gmail with the recipient and subject already filled in.</p></div></div><a className="admin-messages__gmail" href={gmailReplyUrl(selected)} target="_blank" rel="noopener noreferrer">Reply in Gmail <ExternalLink size={17}/></a></div>
              </div>
              <div className="admin-messages__reader-actions"><button disabled={busy || selected.status === "REPLIED"} className="admin-messages__button admin-messages__button--primary" onClick={() => void changeStatus(selected, "REPLIED")}><CheckCheck size={17}/> Mark replied</button><button disabled={busy || selected.status !== "NEW"} className="admin-messages__button" onClick={() => void changeStatus(selected, "READ")}><Check size={17}/> Mark read</button><button disabled={busy || selected.status === "ARCHIVED"} className="admin-messages__button" onClick={() => void changeStatus(selected, "ARCHIVED")}><Archive size={17}/> Archive</button><button disabled={busy} className="admin-messages__button admin-messages__button--danger" onClick={() => setPendingDelete(selected)}><Trash2 size={17}/> Delete</button></div>
            </> : <div className="admin-messages__empty admin-messages__empty--reader"><span className="admin-messages__empty-icon"><Mail size={30}/></span><h2>Select a message</h2><p>Choose a customer enquiry from the inbox to read it and reply through Gmail.</p></div>}
        </div>
      </div>

      {pendingDelete && <div className="admin-messages__overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget && !busy) setPendingDelete(null); }}><div className="admin-messages__dialog" role="dialog" aria-modal="true" aria-labelledby="admin-delete-title"><h2 id="admin-delete-title">Delete message?</h2><p>The message from <strong>{pendingDelete.name}</strong> will be permanently deleted.</p><div><button className="admin-messages__button" disabled={busy} onClick={() => setPendingDelete(null)}><ArrowLeft size={16}/> Cancel</button><button className="admin-messages__button admin-messages__button--danger" disabled={busy} onClick={() => void remove()}><Trash2 size={16}/>{busy ? "Deleting…" : "Delete permanently"}</button></div></div></div>}
    </section>
  );
}
