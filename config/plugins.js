module.exports = ({ env }) => ({
  // ...
  email: {
    config: {
      provider: 'sendgrid', // For community providers pass the full package name (e.g. provider: 'strapi-provider-email-mandrill')
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        defaultFrom: 'alumno.254958@ies-azarquiel.es',
        defaultReplyTo: 'alumno.254958@ies-azarquiel.es',
        testAddress: 'alumno.254958@ies-azarquiel.es',
      },
    },
  },
});

  