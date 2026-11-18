export function onlineTeacherEntry(files) {
  if(Object.hasOwn(files,'workspace.html'))return 'workspace.html';
  if(Object.hasOwn(files,'index.html'))return 'index.html';
  throw Error('Teacher entry missing');
}
export function prepareOnlineIndex(html,{task,version}) {
  if(!/^[a-zA-Z0-9_-]+$/.test(version))throw Error('Invalid asset version');
  if(html.includes('classroom/online-workspace')){
    if(task!=='GC-CLASSROOM-01')throw Error('Unowned online workspace');
    for(const ext of ['mjs','css'])if((html.match(new RegExp(`classroom/online-workspace\\.${ext}`,'g'))||[]).length!==1)throw Error('Ambiguous online workspace');
    return html.replace(/(classroom\/online-workspace\.(?:mjs|css))(?:\?[^"']*)?/g,`$1?v=${version}`);
  }
  if(!html.includes('</head>')||!html.includes('</body>'))throw Error('Missing HTML insertion points');
  return html.replace('</head>',`<link rel="stylesheet" href="./classroom/online-workspace.css?v=${version}">\n</head>`).replace('</body>',`<script type="module" src="./classroom/online-workspace.mjs?v=${version}"></script>\n</body>`);
}
export function hostingRewrites(original=[]) {
 const other=original.filter(r=>(r.source||r.glob)!=='/api/classroom/**').map(({glob,...r})=>({...r,source:r.source||glob}));
 return [{source:'/api/classroom/**',function:{functionId:'classroomWeb',region:'europe-west1'}},...other];
}

// A REST Hosting version uses glob/run fields. Clone its files separately and
// change only this owned route, retaining every other serving setting.
export function repairOnlineServingConfig(config) {
  const preserved = structuredClone(config);
  const otherRewrites = (preserved.rewrites || []).filter(
    rewrite => rewrite.glob !== '/api/classroom/**'
  );
  return {
    ...preserved,
    rewrites: [
      {
        glob: '/api/classroom/**',
        run: {serviceId: 'classroomweb', region: 'europe-west1'}
      },
      ...otherRewrites
    ]
  };
}
