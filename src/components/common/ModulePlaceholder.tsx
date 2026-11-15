interface ModulePlaceholderProps {
  /** Nombre del módulo pendiente de implementación. */
  title: string;
  /** Explicación corta del módulo cuando exista. */
  description: string;
}

/**
 * Estado provisional de los módulos aún no implementados (Fase 0).
 * Se reemplaza por la vista real de cada módulo en su fase del roadmap.
 */
export default function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-10 text-center">
      <h2 className="text-2xl font-semibold text-accent">{title}</h2>
      <p className="max-w-md text-sm text-text-secondary">{description}</p>
      <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
        Módulo en desarrollo
      </p>
    </section>
  );
}
