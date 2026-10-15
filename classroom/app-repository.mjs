import {createLocalTourRepository} from '../guest-tour-port.mjs';
export function createClassroomAppRepository(){
 const quizzes=new Map();let sequence=1;
 const port={create(payload){const code=payload.id||`DEMO${String(++sequence).padStart(5,'0')}`;if(quizzes.has(code))throw Error('Test-ID besteht bereits.');const repo=createLocalTourRepository({code});repo.create(payload);quizzes.set(code,repo);return code;},list(){return [...quizzes].map(([id,r])=>r.getQuiz(id));},clear(){quizzes.clear();}};
 for(const method of ['getQuiz','getQuestions','save','publish','submit','getSubmissions','grade'])port[method]=(code,...args)=>{const repo=quizzes.get(code);if(!repo){if(['getQuiz','getQuestions','getSubmissions'].includes(method))return method==='getQuiz'?null:[];throw Error('Lokaler Test fehlt.');}return repo[method](code,...args);};
 return port;
}
