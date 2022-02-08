module.exports = {
  name: 'mixpanel',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/mixpanel',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
