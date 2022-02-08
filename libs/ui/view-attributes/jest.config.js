module.exports = {
  name: 'ui-view-attributes',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/ui/view-attributes',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
