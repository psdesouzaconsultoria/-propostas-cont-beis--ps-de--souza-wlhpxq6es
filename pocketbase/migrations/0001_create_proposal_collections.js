migrate(
  (app) => {
    // 1. Settings collection (single or per-office settings)
    const settingsCol = new Collection({
      name: 'settings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'office_name', type: 'text', required: true },
        { name: 'responsible_name', type: 'text' },
        { name: 'contact_email', type: 'email' },
        { name: 'contact_phone', type: 'text' },
        { name: 'contact_website', type: 'text' },
        { name: 'validity_days', type: 'number', min: 1 },
        { name: 'commercial_notes', type: 'text' },
        // Pricing rules stored as JSON: base prices per regime/plan, tiers, vidas, notes, etc.
        { name: 'pricing_config', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(settingsCol)

    // 2. Corporate services (serviços societários)
    const servicesCol = new Collection({
      name: 'corporate_services',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'text' },
        { name: 'regular_price', type: 'number', min: 0, required: false },
        { name: 'discount_percent', type: 'number', min: 0, max: 100 },
        { name: 'observations', type: 'text' },
        { name: 'order', type: 'number' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(servicesCol)

    // 3. Proposals history (propostas comerciais salvas)
    const proposalsCol = new Collection({
      name: 'proposals',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'code', type: 'text' },
        { name: 'client_name', type: 'text', required: true },
        { name: 'contact_person', type: 'text' },
        { name: 'contact_email', type: 'email' },
        { name: 'contact_phone', type: 'text' },
        { name: 'client_segment', type: 'text' },
        {
          name: 'tax_regime',
          type: 'select',
          values: ['simples_servico', 'simples_comercio', 'lucro_presumido', 'lucro_real'],
          required: true,
          maxSelect: 1,
        },
        { name: 'monthly_revenue', type: 'number', min: 0 },
        { name: 'employees_count', type: 'number', min: 0 },
        { name: 'invoices_count', type: 'number', min: 0 },
        { name: 'admissions_departures_count', type: 'number', min: 0 },
        {
          name: 'recommended_plan',
          type: 'select',
          values: ['bronze', 'prata', 'ouro'],
          required: true,
          maxSelect: 1,
        },
        { name: 'included_plans', type: 'json' }, // ["bronze", "prata", "ouro"]
        { name: 'include_corporate_card', type: 'bool' },
        { name: 'calculated_plans', type: 'json' }, // Detailed breakdown for each plan
        {
          name: 'status',
          type: 'select',
          values: ['draft', 'sent', 'approved', 'declined'],
          maxSelect: 1,
        },
        { name: 'valid_until', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'created_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(proposalsCol)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('proposals'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('corporate_services'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('settings'))
    } catch (_) {}
  },
)
