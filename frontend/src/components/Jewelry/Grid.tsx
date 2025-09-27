export default function Grid({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 m-4 mt-0">
      {children}
    </section>
  );
}
