export default function WhatWeBuilt() {
  return (
    <div className="w-screen h-screen overflow-hidden relative bg-bg text-text font-body p-[4vw] flex flex-col">
      <div className="w-full h-full border-[0.2vw] border-text rounded-[1vw] bg-white flex flex-col shadow-[0.5vw_0.5vw_0_rgba(0,0,0,0.05)]">
        <div className="h-[6vh] border-b-[0.2vw] border-text flex items-center px-[2vw] gap-[1vw]">
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="w-[1.5vw] h-[1.5vw] border-[0.15vw] border-text rounded-full" />
          <div className="flex-1" />
          <div className="text-[1.2vw] tracking-[0.1em] font-mono">[ dockerquest.app ]</div>
        </div>

        <div className="flex-1 p-[4vw] flex flex-col">
          <h2 className="text-[3.8vw] font-light leading-[1.1] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
            What we built
          </h2>
          <p className="text-[1.4vw] text-[#666666] mt-[2vh] max-w-[60vw]">
            Ten hands-on Docker challenges, an in-browser editor, and a progress tracker.
          </p>

          <div className="flex gap-[3vw] flex-1 mt-[5vh]">
            {/* Left: feature checklist */}
            <div className="flex-1 flex flex-col gap-[2.5vh]">
              <div className="border-[0.15vw] border-dashed border-muted rounded-[0.5vw] bg-[#fafafa] p-[1.8vw]">
                <h3 className="text-[1.7vw] font-medium m-0 mb-[1vh]">[ Challenge map ]</h3>
                <p className="text-[1.1vw] text-[#666666] m-0 leading-[1.5]">
                  Ten Dockerfile challenges, ordered from "first FROM line" through multi-stage builds.
                </p>
              </div>

              <div className="border-[0.15vw] border-dashed border-muted rounded-[0.5vw] bg-[#fafafa] p-[1.8vw]">
                <h3 className="text-[1.7vw] font-medium m-0 mb-[1vh]">[ In-browser editor ]</h3>
                <p className="text-[1.1vw] text-[#666666] m-0 leading-[1.5]">
                  Write Dockerfiles, get instant feedback, see what each layer does.
                </p>
              </div>

              <div className="border-[0.15vw] border-dashed border-muted rounded-[0.5vw] bg-[#fafafa] p-[1.8vw]">
                <h3 className="text-[1.7vw] font-medium m-0 mb-[1vh]">[ Progress tracker ]</h3>
                <p className="text-[1.1vw] text-[#666666] m-0 leading-[1.5]">
                  Saves what you finished and the code you wrote — locally at first, on the server once you sign in.
                </p>
              </div>
            </div>

            {/* Right: fake app UI */}
            <div className="flex-1 border-[0.2vw] border-text rounded-[0.5vw] overflow-hidden flex flex-col">
              <div className="border-b-[0.2vw] border-text h-[4vh] bg-[#f0f0f0] flex items-center px-[1vw] gap-[1vw]">
                <div className="w-[2vw] h-[1vw] bg-[#dddddd] rounded-[0.2vw]" />
                <div className="w-[5vw] h-[1vw] bg-[#dddddd] rounded-[0.2vw]" />
              </div>
              <div className="flex-1 p-[1.5vw] flex flex-col gap-[1.2vh] bg-white">
                <div className="border-[0.15vw] border-dashed border-[#cccccc] rounded-[0.3vw] px-[1vw] py-[1.2vh] flex items-center justify-between text-[1vw]">
                  <span className="font-mono">01 · Your First Dockerfile</span>
                  <span className="text-[#888]">[ done ]</span>
                </div>
                <div className="border-[0.15vw] border-dashed border-[#cccccc] rounded-[0.3vw] px-[1vw] py-[1.2vh] flex items-center justify-between text-[1vw]">
                  <span className="font-mono">02 · Layers and Caching</span>
                  <span className="text-[#888]">[ done ]</span>
                </div>
                <div className="border-[0.15vw] border-dashed border-[#cccccc] rounded-[0.3vw] px-[1vw] py-[1.2vh] flex items-center justify-between text-[1vw]">
                  <span className="font-mono">03 · COPY vs ADD</span>
                  <span className="text-[#888]">[ in progress ]</span>
                </div>
                <div className="border-[0.15vw] border-dashed border-[#cccccc] rounded-[0.3vw] px-[1vw] py-[1.2vh] flex items-center justify-between text-[1vw] text-[#aaaaaa]">
                  <span className="font-mono">04 · Multi-stage Builds</span>
                  <span>[ locked ]</span>
                </div>
                <div className="border-[0.15vw] border-dashed border-[#cccccc] rounded-[0.3vw] px-[1vw] py-[1.2vh] flex items-center justify-between text-[1vw] text-[#aaaaaa]">
                  <span className="font-mono">05 · Volumes</span>
                  <span>[ locked ]</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>02</div>
          </div>
        </div>
      </div>
    </div>
  );
}
