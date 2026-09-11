import type { ReactNode } from 'react';

export default function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h3 className="panel-title">{title}</h3>
      <div className="panel-body">{children}</div>
    </section>
  );
}
