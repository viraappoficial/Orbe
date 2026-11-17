// Mapa do Google embutido (tema escuro via filtro CSS). Sem chave de API.
export default function MapaLocal({
  local,
  endereco,
  cidade,
  embed,
}: {
  local: string;
  endereco: string;
  cidade?: string;
  embed?: string;
}) {
  // Busca pelo endereço (não pelo nome), que o Google resolve com mais precisão.
  const consulta = [endereco, cidade].filter(Boolean).join(", ");
  const src =
    embed || `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&output=embed&hl=pt-BR`;
  const abrir = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-line md:aspect-[16/10]">
        <iframe
          title={`Mapa: ${local}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="map-dark absolute inset-0 h-full w-full border-0"
        />
      </div>
      <a
        href={abrir}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-block text-xs uppercase tracking-[0.3em] text-muted underline-offset-4 hover:text-accent hover:underline"
      >
        Abrir no Maps
      </a>
    </div>
  );
}
