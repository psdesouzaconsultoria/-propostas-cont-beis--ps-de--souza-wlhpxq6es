migrate(
  (app) => {
    // 1. Seed user if not exists
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'psdesouzaconsultoria@gmail.com')
    } catch (_) {
      const userRecord = new Record(users)
      userRecord.setEmail('psdesouzaconsultoria@gmail.com')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Escritório Contábil')
      app.save(userRecord)
    }

    // 2. Seed default settings
    const settingsCol = app.findCollectionByNameOrId('settings')
    const existingSettings = app.findRecordsByFilter('settings', '', '', 1, 0)
    if (existingSettings.length === 0) {
      const defaultPricingConfig = {
        basePrices: {
          simples_servico: { bronze: 490, prata: 790, ouro: 1290 },
          simples_comercio: { bronze: 590, prata: 890, ouro: 1490 },
          lucro_presumido: { bronze: 890, prata: 1290, ouro: 1990 },
          lucro_real: { bronze: 1490, prata: 2190, ouro: 3290 },
        },
        revenueTiers: [
          { max: 30000, additional: { bronze: 0, prata: 0, ouro: 0 } },
          { max: 60000, additional: { bronze: 100, prata: 150, ouro: 200 } },
          { max: 100000, additional: { bronze: 200, prata: 300, ouro: 400 } },
          { max: 200000, additional: { bronze: 400, prata: 550, ouro: 750 } },
          { max: 500000, additional: { bronze: 800, prata: 1100, ouro: 1500 } },
          { max: 1000000, additional: { bronze: 1500, prata: 2000, ouro: 2800 } },
        ],
        employeeCostPerHead: {
          bronze: 45,
          prata: 40,
          ouro: 35,
        },
        admissionDepartureCost: {
          bronze: 60,
          prata: 50,
          ouro: 40,
        },
        invoicesAllowance: {
          bronze: 30,
          prata: 70,
          ouro: 150,
        },
        excessInvoiceCost: {
          bronze: 3.5,
          prata: 2.5,
          ouro: 1.8,
        },
      }

      const settingRecord = new Record(settingsCol)
      settingRecord.set('office_name', 'M&S Contabilidade & Consultoria Estratégica')
      settingRecord.set('responsible_name', 'Paulo de Souza - Contador CRC/SP')
      settingRecord.set('contact_email', 'contato@mscontabilidade.com.br')
      settingRecord.set('contact_phone', '(11) 98765-4321')
      settingRecord.set('contact_website', 'www.mscontabilidade.com.br')
      settingRecord.set('validity_days', 15)
      settingRecord.set(
        'commercial_notes',
        'Valores para pagamento até o dia 10 de cada mês via boleto ou Pix. Reajuste anual pelo IPCA. Não estão inclusas taxas de órgãos públicos (JUCESP, Receita, Prefeitura) ou certificados digitais.',
      )
      settingRecord.set('pricing_config', defaultPricingConfig)
      app.save(settingRecord)
    }

    // 3. Seed corporate services
    const servicesCol = app.findCollectionByNameOrId('corporate_services')
    const existingServices = app.findRecordsByFilter('corporate_services', '', '', 1, 0)
    if (existingServices.length === 0) {
      const defaultServices = [
        {
          name: 'Abertura de Empresa (Constituição)',
          category: 'Constituição',
          regular_price: 1200,
          discount_percent: 50,
          observations: 'Isenção de honorários no plano Ouro',
        },
        {
          name: 'Alteração Contratual / Consolidação',
          category: 'Societário',
          regular_price: 950,
          discount_percent: 30,
          observations: 'Atos de sócios, endereço e CNAE',
        },
        {
          name: 'Baixa / Encerramento de Empresa',
          category: 'Societário',
          regular_price: 1400,
          discount_percent: 25,
          observations: 'Distrato social e certidões negativas',
        },
        {
          name: 'Certidões Negativas / Regularização Fiscal',
          category: 'Certidões',
          regular_price: 350,
          discount_percent: 40,
          observations: 'Emissão e desembaraço de CNDs',
        },
        {
          name: 'Transformação de MEI para ME / EPP',
          category: 'Societário',
          regular_price: 800,
          discount_percent: 35,
          observations: 'Enquadramento e adequação contratual',
        },
        {
          name: 'Registro de Marca (INPI) - Parceria',
          category: 'Propriedade',
          regular_price: 1800,
          discount_percent: 20,
          observations: 'Pesquisa prévia e protocolo',
        },
        {
          name: 'Emissão de Decore / Faturamento Histórico',
          category: 'Documentos',
          regular_price: 250,
          discount_percent: 50,
          observations: 'Para fins bancários e comprovação',
        },
        {
          name: 'Declaração de IRPF dos Sócios',
          category: 'Pessoa Física',
          regular_price: 450,
          discount_percent: 30,
          observations: 'Condições especiais para titulares',
        },
      ]

      let order = 1
      for (const s of defaultServices) {
        const rec = new Record(servicesCol)
        rec.set('name', s.name)
        rec.set('category', s.category)
        rec.set('regular_price', s.regular_price)
        rec.set('discount_percent', s.discount_percent)
        rec.set('observations', s.observations)
        rec.set('order', order++)
        rec.set('is_active', true)
        app.save(rec)
      }
    }

    // 4. Seed a sample proposal
    const proposalsCol = app.findCollectionByNameOrId('proposals')
    const existingProposals = app.findRecordsByFilter('proposals', '', '', 1, 0)
    if (existingProposals.length === 0) {
      const p = new Record(proposalsCol)
      p.set('code', 'PROP-2025-001')
      p.set('client_name', 'TechLab Soluções Digitais Ltda')
      p.set('contact_person', 'Mariana Alencar')
      p.set('contact_email', 'mariana@techlab.com.br')
      p.set('contact_phone', '(11) 99123-4567')
      p.set('client_segment', 'Tecnologia & SaaS')
      p.set('tax_regime', 'simples_servico')
      p.set('monthly_revenue', 75000)
      p.set('employees_count', 4)
      p.set('invoices_count', 45)
      p.set('admissions_departures_count', 1)
      p.set('recommended_plan', 'prata')
      p.set('included_plans', ['bronze', 'prata', 'ouro'])
      p.set('include_corporate_card', true)
      p.set('status', 'sent')

      // Sample calculated plans breakdown
      p.set('calculated_plans', {
        bronze: {
          total: 932.5,
          breakdown: {
            base: 490,
            revenueTier: 200,
            employees: 180,
            admissions: 60,
            excessInvoices: 52.5,
          },
        },
        prata: {
          total: 1300,
          breakdown: {
            base: 790,
            revenueTier: 300,
            employees: 160,
            admissions: 50,
            excessInvoices: 0,
          },
        },
        ouro: {
          total: 1870,
          breakdown: {
            base: 1290,
            revenueTier: 400,
            employees: 140,
            admissions: 40,
            excessInvoices: 0,
          },
        },
      })
      p.set(
        'notes',
        'Cliente busca migrar de contabilidade tradicional e automatizar emissão de NFS-e.',
      )
      app.save(p)
    }
  },
  (app) => {
    // Down migration
    app.db().newQuery("DELETE FROM proposals WHERE code = 'PROP-2025-001'").execute()
    app.db().newQuery('DELETE FROM corporate_services').execute()
    app.db().newQuery('DELETE FROM settings').execute()
  },
)
