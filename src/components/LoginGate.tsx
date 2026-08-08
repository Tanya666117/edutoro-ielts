import { FormEvent, useState } from 'react'
import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react'

interface LoginGateProps {
  error: string | null
  onSubmit: (username: string, password: string) => void
}

export function LoginGate({ error, onSubmit }: LoginGateProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(username.trim(), password)
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff3a5_0%,#fff9dc_56%,#ffffff_100%)]">
      <div className="shell flex min-h-screen items-center justify-center py-10">
        <section className="card w-full max-w-[460px] p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[8px] bg-[var(--yellow-soft)] text-[var(--ink)]">
              <LockKeyhole size={20} />
            </div>
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-[var(--teal)]">Sign in</p>
              <h1 className="mt-1 text-[26px] font-black leading-tight text-[var(--ink)]">Edutoro 登录</h1>
            </div>
          </div>

          <p className="mb-6 text-[15px] leading-7 text-[var(--ink-2)]">
            请输入用户名和密码后进入网站。这个登录页是前端门禁，用来做访问控制。
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-[13px] font-bold text-[var(--ink-2)]">用户名</span>
              <div className="flex items-center gap-3 rounded-[8px] border border-[rgba(23,23,23,0.12)] bg-white px-4 py-3">
                <UserRound size={18} className="shrink-0 text-[var(--ink-3)]" />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="请输入用户名"
                  className="w-full border-0 bg-transparent text-[15px] outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-[13px] font-bold text-[var(--ink-2)]">密码</span>
              <div className="flex items-center gap-3 rounded-[8px] border border-[rgba(23,23,23,0.12)] bg-white px-4 py-3">
                <LockKeyhole size={18} className="shrink-0 text-[var(--ink-3)]" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="请输入密码"
                  className="w-full border-0 bg-transparent text-[15px] outline-none"
                />
              </div>
            </label>

            {error && <p className="rounded-[8px] bg-[#fff1a8] px-4 py-3 text-[13px] font-bold text-[var(--ink)]">{error}</p>}

            <button type="submit" className="btn btn-dark w-full justify-center">
              进入网站
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="mt-5 text-[12px] leading-6 text-[var(--ink-3)]">
            默认账号：<span className="font-bold text-[var(--ink)]">edutoro</span> /{' '}
            <span className="font-bold text-[var(--ink)]">edutoro123</span>
          </p>
        </section>
      </div>
    </main>
  )
}
