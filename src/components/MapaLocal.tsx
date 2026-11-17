// Localização do evento. Com o código de incorporação do Google (feito no painel), mostra o mapa real.
// Sem ele, mostra um cartão com o endereço e os botões do Google Maps: nunca um quadro quebrado
// nem um pin adivinhado (geocodificar o endereço pode errar o trecho da avenida por quilômetros).
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
  const consulta = [endereco, cidade].filter(Boolean).join(", ");
  const abrir = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consulta)}`;
  const rota = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(consulta)}`;
  const link = "underline-offset-4 transition-colors hover:text-accent hover:underline";

  return (
    <div>
      {embed ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-line md:aspect-[16/10]">
          <iframe
            title={`Mapa: ${local}`}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="map-dark absolute inset-0 h-full w-full border-0"
          />
        </div>
      ) : (
        <div className="mapa-card relative overflow-hidden border border-line p-6 sm:p-7">
          <div className="mapa-grade" aria-hidden="true" />
          <div className="relative flex items-start gap-5">
            <span className="mapa-pin" aria-hidden="true">
              <svg width="22" height="28" viewBox="0 0 22 28" fill="currentColor">
                <path d="M11 0C4.9 0 0 4.8 0 10.8 0 18.4 11 28 11 28s11-9.6 11-17.2C22 4.8 17.1 0 11 0Zm0 15a4.2 4.2 0 1 1 0-8.4A4.2 4.2 0 0 1 11 15Z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Onde vai ser</p>
              <p className="mt-2 text-lg uppercase tracking-[0.15em]">{local}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{endereco}</p>
              {cidade && <p className="text-sm text-muted">{cidade}</p>}
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.3em] text-muted">
        <a href={abrir} target="_blank" rel="noopener noreferrer" className={link}>
          Abrir no Google Maps
        </a>
        <a href={rota} target="_blank" rel="noopener noreferrer" className={link}>
          Como chegar
        </a>
      </div>
    </div>
  );
}
