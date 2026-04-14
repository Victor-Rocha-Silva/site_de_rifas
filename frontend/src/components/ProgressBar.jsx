export default function ProgressBar({ value = 0 }) {
  return (
    <div
      style={{
        width: "100%",
        height: 12,
        background: "rgba(255,255,255,0.12)",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          borderRadius: 999,
          background: "linear-gradient(90deg, #f59e0b 0%, #f97316 100%)",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}