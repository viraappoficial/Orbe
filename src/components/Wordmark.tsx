import Image from "next/image";

// "ORBE" desenhado como no logo (recorte do próprio logo, fundo transparente).
export default function Wordmark({ className = "h-3 md:h-3.5" }: { className?: string }) {
  return (
    <Image
      src="/wordmark.png"
      alt="ORBE"
      width={840}
      height={105}
      className={`w-auto ${className}`}
    />
  );
}
