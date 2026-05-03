export default function BugsWeCaught() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body p-[4vw] flex flex-col">
      <div className="w-full h-full border-[0.2vw] border-text rounded-[1vw] bg-white flex flex-col shadow-[0.5vw_0.5vw_0_rgba(0,0,0,0.05)]">
        <div className="h-[6vh] border-b-[0.2vw] border-text flex items-center px-[2vw] gap-[1vw]">
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="flex-1" />
          <div className="text-[1.2vw] tracking-[0.1em] font-mono">[ message 04 of 5 ]</div>
        </div>

        <div className="flex-1 p-[4vw] flex flex-col">
          <h2 className="text-[3.8vw] font-light leading-[1.1] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
            "Now tell the story"
          </h2>
          <p className="text-[1.4vw] text-[#666666] mt-[2vh] max-w-[60vw]">
            The very prompt that produced this deck.
          </p>

          <div className="flex-1 mt-[5vh] flex flex-col gap-[3vh] justify-center max-w-[68vw] mx-auto w-full">
            {/* User bubble — the meta moment */}
            <div className="flex gap-[1.5vw] items-start justify-end">
              <div className="max-w-[75%] border-[0.2vw] border-text bg-[#f0f0f0] rounded-[0.5vw] px-[2vw] py-[1.8vh] relative">
                <div className="text-[0.9vw] font-mono text-[#888888] mb-[0.8vh]">you</div>
                <div className="text-[1.5vw] leading-[1.4]">
                  Build me a presentation deck about the journey, with the bug highlights, and put it in a folder. Then tell me how to host it.
                </div>
                <div className="absolute -top-[1vw] -left-[1vw] w-[1.8vw] h-[1.8vw] border-l-[0.2vw] border-t-[0.2vw] border-black -rotate-12 z-20" />
              </div>
              <div className="w-[3vw] h-[3vw] border-[0.2vw] border-text rounded-full bg-white flex items-center justify-center text-[1vw] font-mono shrink-0">
                you
              </div>
            </div>

            {/* Agent reply */}
            <div className="flex gap-[1.5vw] items-start">
              <div className="w-[3vw] h-[3vw] border-[0.2vw] border-dashed border-text rounded-full bg-[#fafafa] flex items-center justify-center text-[1vw] font-mono shrink-0">
                ai
              </div>
              <div className="max-w-[78%] border-[0.15vw] border-dashed border-text bg-[#fafafa] rounded-[0.5vw] px-[2vw] py-[1.8vh]">
                <div className="text-[0.9vw] font-mono text-[#888888] mb-[1vh]">agent</div>
                <div className="text-[1.4vw] leading-[1.5] text-[#555555]">
                  Six wireframe-style slides in <span className="font-mono text-[1.2vw]">artifacts/dockerquest-deck</span>. Publish on Replit for a shareable link, or export to PDF / PPTX for offline use.
                </div>
              </div>
            </div>

            <div className="text-center text-[1vw] font-mono text-[#888888] mt-[2vh]">
              [ you are reading slide 5 of that deck right now ]
            </div>
          </div>
        </div>

        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>05</div>
          </div>
        </div>
      </div>
    </div>
  );
}
