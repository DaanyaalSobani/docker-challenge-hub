export default function AddingAuth() {
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
            Adding sign-in
          </h2>
          <p className="text-[1.4vw] text-[#666666] mt-[2vh] max-w-[60vw]">
            So progress follows you across machines, not just one browser.
          </p>

          <div className="flex gap-[3vw] flex-1 mt-[5vh]">
            {/* Left: anonymous */}
            <div className="flex-1 border-[0.2vw] border-text rounded-[0.5vw] bg-white p-[2vw] flex flex-col">
              <div className="text-[1vw] font-mono text-[#888888]">[ before ]</div>
              <div className="text-[2vw] font-medium mt-[1vh]">Logged out</div>
              <div className="border-t-[0.15vw] border-dashed border-[#cccccc] my-[2vh]" />
              <ul className="text-[1.2vw] text-[#555555] leading-[1.7] list-none p-0 m-0 flex flex-col gap-[1vh]">
                <li>· Progress saved to localStorage</li>
                <li>· One browser, one device</li>
                <li>· Clear cache, lose your work</li>
              </ul>
            </div>

            {/* Right: authed */}
            <div className="flex-1 border-[0.2vw] border-text rounded-[0.5vw] bg-[#fafafa] p-[2vw] flex flex-col relative">
              <div className="text-[1vw] font-mono text-[#888888]">[ after ]</div>
              <div className="text-[2vw] font-medium mt-[1vh]">Signed in</div>
              <div className="border-t-[0.15vw] border-dashed border-[#cccccc] my-[2vh]" />
              <ul className="text-[1.2vw] text-[#555555] leading-[1.7] list-none p-0 m-0 flex flex-col gap-[1vh]">
                <li>· Progress synced to Postgres</li>
                <li>· Pick up on any device</li>
                <li>· Local progress merges in on first sign-in</li>
              </ul>
              <div className="absolute -bottom-[1vw] -right-[1vw] w-[2vw] h-[2vw] border-l-[0.2vw] border-t-[0.2vw] border-black -rotate-12 z-20" />
            </div>
          </div>

          <div className="mt-[3vh] text-[1.1vw] font-mono text-[#666666] border-l-[0.4vw] border-[#e0e0e0] pl-[1.5vw]">
            GET /api/me/progress · PUT /api/me/progress · session cookie · OIDC + PKCE
          </div>
        </div>

        <div className="h-[5vh] border-t-[0.2vw] border-text flex items-center justify-between px-[3vw] text-[1vw] text-muted">
          <div>DockerQuest · Build Notes</div>
          <div className="flex gap-[2vw]">
            <div>2026</div>
            <div>04</div>
          </div>
        </div>
      </div>
    </div>
  );
}
