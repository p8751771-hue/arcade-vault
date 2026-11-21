import { HallOfFame } from "@/components/hall-of-fame";

export default function HallOfFamePage() {
  return (
    <main className="animate-fade-slide relative z-[1] mx-auto w-full max-w-[1000px] px-5 pt-11 pb-20">
      <h1 className="m-0 mb-[30px] text-center font-pixel text-[clamp(20px,4.6vw,40px)] leading-[1.4] font-normal text-neon-yellow [text-shadow:0_0_8px_#f5ff00,0_0_30px_rgb(245_255_0/0.6)]">
        SALÓN DE LA FAMA
      </h1>
      <HallOfFame />
    </main>
  );
}
