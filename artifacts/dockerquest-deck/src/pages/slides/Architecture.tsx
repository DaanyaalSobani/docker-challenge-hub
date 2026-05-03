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

        <div className="flex-1 p-[4vw] flex flex-col">
          <h2 className="text-[3.8vw] font-light leading-[1.1] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
            "Make it real"
          </h2>
          <p className="text-[1.4vw] text-[#666666] mt-[2vh] max-w-[60vw]">
            The moment localStorage stopped being enough.
          </p>

          <div className="flex-1 mt-[5vh] flex flex-col gap-[3vh] justify-center max-w-[68vw] mx-auto w-full">
            {/* User bubble */}
            <div className="flex gap-[1.5vw] items-start justify-end">
              <div className="max-w-[70%] border-[0.2vw] border-text bg-[#f0f0f0] rounded-[0.5vw] px-[2vw] py-[1.8vh] relative">
                <div className="text-[0.9vw] font-mono text-[#888888] mb-[0.8vh]">you</div>
                <div className="text-[1.6vw] leading-[1.4]">
                  Add Replit Auth so my progress follows me across machines.
                </div>
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
                <div className="text-[1.3vw] leading-[1.5] text-[#555555] mb-[1.5vh]">
                  OIDC + PKCE through the Replit Auth lib. Two new endpoints, one provider on the client:
                </div>
                <div className="font-mono text-[1vw] text-[#333333] bg-white border-[0.15vw] border-dashed border-[#cccccc] rounded-[0.3vw] px-[1.2vw] py-[1vh] flex flex-col gap-[0.5vh]">
                  <div>GET  /api/me/progress</div>
                  <div>PUT  /api/me/progress</div>
                  <div>+ ProgressProvider on the client</div>
                </div>
              </div>
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
