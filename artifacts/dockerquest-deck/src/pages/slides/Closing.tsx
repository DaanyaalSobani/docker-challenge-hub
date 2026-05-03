export default function Closing() {
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

        <div className="flex-1 p-[4vw] flex flex-col items-center justify-center text-center">
          <div className="text-[1vw] font-mono text-[#888888] mb-[2vh] tracking-[0.1em]">[ end of build notes ]</div>

          <h2 className="text-[5.5vw] font-light leading-[1.1] tracking-[-0.02em] m-0 underline decoration-[#cccccc] decoration-wavy underline-offset-[0.5vw]">
            Try it. Break it.
          </h2>

          <p className="text-[1.6vw] text-[#555555] m-0 mt-[3vh] max-w-[55vw] leading-[1.5]">
            DockerQuest is live. Sign in, sync your progress, and see how far you get before the next bug shows up.
          </p>

          <div className="mt-[6vh] flex gap-[1.5vw] items-center">
            <div className="border-[0.2vw] border-[#999999] rounded-[0.5vw] bg-[#fafafa] px-[2.5vw] py-[1.4vw] text-[1.2vw] font-mono text-[#666666]">
              dockerquest.replit.app
            </div>
            <div className="border-[0.2vw] border-text rounded-[0.5vw] bg-text text-white px-[2.5vw] py-[1.4vw] text-[1.2vw] font-medium relative">
              [ Open ]
              <div className="absolute -bottom-[1.5vw] -right-[1.5vw] w-[2vw] h-[2vw] border-l-[0.2vw] border-t-[0.2vw] border-black -rotate-12 z-20" />
            </div>
          </div>

          <div className="mt-[5vh] text-[1vw] text-[#999999] border-b-[0.1vw] border-dashed border-[#999999] pb-[0.3vh]">
            built on Replit · React · Express · Postgres
          </div>
        </div>

        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>06</div>
          </div>
        </div>
      </div>
    </div>
  );
}
