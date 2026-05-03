import iterationShot from "@assets/image_1777768771568.png";

export default function Architecture() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body p-[4vw] flex flex-col">
      <div className="w-full h-full border-[0.2vw] border-text rounded-[1vw] bg-white flex flex-col shadow-[0.5vw_0.5vw_0_rgba(0,0,0,0.05)]">
        <div className="h-[6vh] border-b-[0.2vw] border-text flex items-center px-[2vw] gap-[1vw]">
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="flex-1" />
          <div className="text-[1.2vw] tracking-[0.1em] font-mono">[ message 02 of 5 ]</div>
        </div>

        <div className="flex-1 p-[3vw] flex gap-[3vw]">
          {/* Left: context */}
          <div className="w-[32vw] flex flex-col justify-center">
            <div className="text-[1vw] font-mono text-[#888888] mb-[1.5vh] tracking-[0.1em]">[ iteration phase ]</div>
            <h2 className="text-[3.6vw] font-light leading-[1.05] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
              Then we used it
            </h2>
            <p className="text-[1.4vw] text-[#555555] mt-[3vh] leading-[1.5] border-l-[0.4vw] border-[#e0e0e0] pl-[1.5vw]">
              The first version shipped. Then real bugs and real wishes started showing up.
            </p>

            <div className="mt-[3vh] flex flex-col gap-[1.5vh]">
              <div className="border-[0.15vw] border-dashed border-muted rounded-[0.5vw] bg-[#fafafa] px-[1.5vw] py-[1.2vh]">
                <div className="text-[0.95vw] font-mono text-[#888888]">[ bug report ]</div>
                <div className="text-[1.1vw] text-[#555555] mt-[0.5vh]">File switcher copying text between challenges</div>
              </div>
              <div className="border-[0.15vw] border-dashed border-muted rounded-[0.5vw] bg-[#fafafa] px-[1.5vw] py-[1.2vh]">
                <div className="text-[0.95vw] font-mono text-[#888888]">[ feature request ]</div>
                <div className="text-[1.1vw] text-[#555555] mt-[0.5vh]">Persist completed challenge code to localStorage</div>
              </div>
            </div>
          </div>

          {/* Right: screenshot */}
          <div className="flex-1 border-[0.2vw] border-text rounded-[0.5vw] bg-[#fafafa] p-[1.5vw] flex items-center justify-center relative shadow-[0.4vw_0.4vw_0_#eeeeee]">
            <img
              src={iterationShot}
              alt="Two follow-up chat messages: a bug report about file switching and a feature request to persist code to localStorage"
              className="max-w-full max-h-full object-contain border-[0.15vw] border-[#cccccc] rounded-[0.3vw]"
            />
            <div className="absolute -top-[1vw] -left-[1vw] w-[2vw] h-[2vw] border-l-[0.2vw] border-t-[0.2vw] border-black -rotate-12 z-20" />
            <div className="absolute -bottom-[2vh] left-[2vw] text-[0.95vw] font-mono text-[#888888] bg-white px-[0.8vw] py-[0.3vh] border-[0.15vw] border-dashed border-[#888888] rounded-[0.3vw]">
              actual chat · two follow-ups
            </div>
          </div>
        </div>

        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>03</div>
          </div>
        </div>
      </div>
    </div>
  );
}
