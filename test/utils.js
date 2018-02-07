function randomText () {
  return Math.random().toString(36).substring(2);
}

function randomCertificate () {
  return {
    '@context': 'https://w3id.org/openbadges/v2',
    'id': `https://example.org/assertions/${randomText()}`,
    'type': 'Assertion',
    'recipient': {
      'type': 'email',
      'identity': `${randomText()}@example.org`
    },
    'issuedOn': '2016-12-31T23:59:59+00:00',
    'verification': {
      'type': 'hosted'
    },
    'badge': {
      'type': 'BadgeClass',
      'id': `https://example.org/badges/${randomText()}`,
      'name': randomText(),
      'description': randomText(),
      'image': `https://example.org/badges/${randomText()}/image`,
      'criteria': {
        'narrative': randomText()
      },
      'issuer': {
        'id': 'https://example.org/issuer',
        'type': 'Profile',
        'name': randomText(),
        'url': 'https://example.org',
        'email': `${randomText()}@example.org`,
        'verification': {
          'allowedOrigins': 'example.org'
        }
      }
    },
    'evidence': [
      {
        'id': `https://example.org/${randomText()}.html`,
        'name': randomText(),
        'description': randomText(),
        'genre': randomText()
      },
      {
        'id': `https://example.org/${randomText()}.html`,
        'name': randomText(),
        'description': randomText()
      }
    ]
  };
}
module.exports = {
  randomCertificate
};
