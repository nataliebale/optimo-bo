module.exports = {
  name: 'ui-notification-view',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/ui/notification-view',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
