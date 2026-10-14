// Entire fixed English test. UI locale never changes these task contents.
export const COLOURS_TEST=Object.freeze({
 id:'colours-animals-grade5',title:'Colours & Animals',subject:'English',grade:5,language:'en',
 instructions:'Read each question carefully. Look at the pictures and listen to the recording.',
 questions:[
  {id:'colours-1',type:'single',points:1,label:'A colourful scarf',prompt:'Look at the rabbit. Which colour is the scarf?',image:'rabbit-red',options:['red','blue','yellow','green']},
  {id:'colours-2',type:'listening',points:1,label:'Listen and choose',prompt:'Listen and choose the correct picture.',audio:'../assets/colours-listening.wav',transcript:'Look at the rabbits. The rabbit has a red scarf. Choose the rabbit with the red scarf.',images:['rabbit-red','rabbit-blue','rabbit-yellow']},
  {id:'colours-3',type:'single',points:1,label:'Find the colour word',prompt:'Which word names a colour?',options:['green','rabbit','window','happy']},
  {id:'colours-4',type:'matching',points:4,label:'Words and colours',prompt:'Match each colour word to the correct colour patch.',words:['red','blue','green','yellow'],patches:['yellow','green','red','blue']},
  {id:'colours-5',type:'text',points:1,label:'The little duck',prompt:'Look at the duck. Complete the sentence: The duck is ____.',image:'duck'},
  {id:'colours-6',type:'single',points:1,label:'Describe the butterfly',prompt:'Which sentence is correct?',image:'butterfly',options:['A blue butterfly.','An blue butterfly.','A butterfly blue.']},
  {id:'colours-7',type:'single',points:1,label:'The friendly frog',prompt:'Look at the frog. Choose the matching sentence.',image:'frog',options:['The frog is green.','The frog is blue.','The frog is red.']},
  {id:'colours-8',type:'ordering',points:1,label:'Build a sentence',prompt:'Put the words in the correct order.',items:['has','a red scarf.','The rabbit']},
  {id:'colours-9',type:'image-choice',points:1,label:'Look closely',prompt:'Which animal is yellow?',images:['duck','butterfly','frog']},
  {id:'colours-10',type:'text',points:2,label:'Your classroom',prompt:'Name two things in your classroom and describe their colours.'}
 ]
});
export const totalPoints=COLOURS_TEST.questions.reduce((sum,q)=>sum+q.points,0);
