interface GameBoardProps {
  params: Promise<{ code: string }>;
}

export default async function GameBoard({ params }: GameBoardProps) {
  const { code } = await params;

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      <h1 className="font-display text-4xl font-bold text-primary">
        Game Board
      </h1>
      <p className="mt-2 text-muted-foreground">
        Room: <span className="font-mono text-foreground">{code}</span>
      </p>
    </main>
  );
}
