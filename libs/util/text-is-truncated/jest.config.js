module.exports = {
  name: 'util-text-is-truncated',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/util/text-is-truncated',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
