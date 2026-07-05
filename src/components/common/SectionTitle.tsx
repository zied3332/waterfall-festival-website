type SectionTitleProps = {
  label: string;
  title: string;
  description?: string;
};

function SectionTitle({ label, title, description }: SectionTitleProps) {
  return (
    <div className="mb-12 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gray-500">
        {label}
      </p>

      <h2 className="mt-4 text-4xl font-bold text-gray-900">{title}</h2>

      {description && (
        <p className="mx-auto mt-4 max-w-xl text-gray-600">{description}</p>
      )}
    </div>
  );
}

export default SectionTitle;