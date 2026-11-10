import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import OfficeLogo from '@/components/OfficeLogo'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('psdesouzaconsultoria@gmail.com')
  const [password, setPassword] = useState('Skip@Pass')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsSubmitting(true)

    try {
      await login(email, password)
    } catch (err: unknown) {
      console.error('Falha no login:', err)
      setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais de acesso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-navy via-[#0B2340] to-brand-navy-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header com a logo oficial do escritório */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-2xl overflow-hidden ring-2 ring-brand-gold/60 shadow-2xl shadow-black/40 mb-5">
            <OfficeLogo className="h-32 w-32 object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-serif">
            PS DE SOUZA
          </h1>
          <p className="text-sm text-brand-gold-light tracking-[0.2em] uppercase mt-1">
            Consultoria & Serviços Contábil
          </p>
          <p className="text-sm text-slate-300/80 mt-3">
            Simulador de Honorários & Gerador Comercial em 3 Planos
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-2xl text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-white">Acesso do Escritório</CardTitle>
            <CardDescription className="text-slate-300">
              Entre com suas credenciais para elaborar propostas e gerenciar preços
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-red-200 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  E-mail do Responsável
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contador@escritorio.com.br"
                    className="pl-9 bg-brand-navy-dark/70 border-white/15 text-white placeholder:text-slate-500 focus-visible:ring-brand-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 bg-brand-navy-dark/70 border-white/15 text-white placeholder:text-slate-500 focus-visible:ring-brand-gold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-brand-gold/10 border border-brand-gold/25 text-xs text-brand-gold-light flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-brand-gold" />
                <span>
                  Ambiente seguro do escritório. Acesso pré-configurado com a conta do
                  administrador.
                </span>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-gold hover:bg-brand-gold-dark text-brand-navy font-bold shadow-lg shadow-brand-gold/25 transition-all cursor-pointer"
              >
                {isSubmitting ? 'Autenticando...' : 'Acessar Simulador de Propostas'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-400/70 mt-6">
          © {new Date().getFullYear()} PS DE SOUZA Consultoria & Serviços Contábil. Todos os
          direitos reservados.
        </p>
      </div>
    </div>
  )
}
