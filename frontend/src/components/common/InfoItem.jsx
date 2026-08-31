export default function InfoItem({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs text-gray-500 font-medium mb-1">
        {label}
      </p>
      <p className="font-semibold text-gray-900 text-sm break-words">
        {value || "N/A"}
      </p>
    </div>
  );
}
