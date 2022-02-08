export const QlModules = {
  toolbar: [
    [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
    //   [{ header: [1, 2, 3, 4, 5, 6, false] }],

    ['bold', 'italic', 'underline',],// 'strike'], // toggled buttons
  //   ['blockquote', 'code-block'],

  //   [{ header: 1 }, { header: 2 }], // custom button values

    [
      { color: [] },
      // { background: [] }
    ], // dropdown with defaults from theme
    [{ list: 'bullet' }, { list: 'ordered' },],
    //   [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    // [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    // [{ direction: 'rtl' }], // text direction
    
  //   [{ font: [] }],
    [{ align: [] }],

  //   ['clean'], // remove formatting button

    ['link', 'image'],// 'image', 'video'] // link and image, video
  ]
}