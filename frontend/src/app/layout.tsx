export const metadata = {
  title: "Idea Lab POC",
  description: "Fábrica de software asistida por agentes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}