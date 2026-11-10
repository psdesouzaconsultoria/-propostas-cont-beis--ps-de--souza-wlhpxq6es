migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('settings')

    // Logo do escritório (arquivo de imagem, exibido na navegação, login e PDF)
    collection.fields.add(
      new Field({
        name: 'logo',
        type: 'file',
        maxSelect: 1,
        maxSize: 5242880, // 5 MB
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      }),
    )

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('settings')
    collection.fields.removeByName('logo')
    app.save(collection)
  },
)
