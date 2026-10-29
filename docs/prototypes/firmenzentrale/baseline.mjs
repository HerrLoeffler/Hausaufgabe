import {areaStatus} from './company-status.mjs';
import {domains} from './portfolio.mjs';
export const baseline=domains.map(d=>[d.name,areaStatus[d.id].built+' Offen: '+areaStatus[d.id].gap,areaStatus[d.id].next]);
