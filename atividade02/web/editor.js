/** Editor reutilizável: matrizes, pares de pontos e opções de cada método. */
import {$, element, numeric, groupOf} from './util.js';

function field(value, label, attributes = {}) {
  return element('input', {type: 'text', inputmode: 'decimal', value: String(value),
    'aria-label': label, autocomplete: 'off', spellcheck: 'false', ...attributes});
}

export class Editor {
  constructor(onChange, onError) {
    this.onChange = onChange;
    this.onError = onError;
    this.root = $('editor');
    this.root.addEventListener('input', event => {
      event.target.removeAttribute('aria-invalid'); this.onChange();
    });
    $('apply-paste').addEventListener('click', () => this.applyPaste());
  }

  render(data, method) {
    this.data = structuredClone(data); this.method = method;
    this.root.replaceChildren();
    const group = groupOf(method);
    if (group === 'sistema') this.renderMatrix(data);
    else this.renderPoints(data);
    if (method === 'gauss_seidel') this.renderIterationOptions(data);
    if (group === 'interpolacao') this.renderInterpolationOptions(data);
    $('paste-hint').textContent = group === 'sistema'
      ? 'Uma equação por linha: coeficientes e, por último, b. Separe por ponto e vírgula ou Tab. Use de 2 a 12 linhas.'
      : 'Um par x; y por linha, separado por ponto e vírgula ou Tab. Vírgula decimal é aceita. De 2 a 100 pontos.';
    const hints = {gauss: 'Ax = b · pivotamento parcial para escolher os pivôs.',
      gauss_seidel: 'Ax = b · cada atualização usa os valores mais recentes.',
      lagrange: 'P(x) = Σ yᵢ Lᵢ(x) · escolha de nós próxima ao alvo.',
      newton: 'P(x) por diferenças divididas · mesmos nós de Lagrange.',
      trapezio: 'Cada intervalo vira um trapézio. Pontos igualmente espaçados.',
      simpson: 'Uma parábola a cada dois intervalos. Exige número par de intervalos.'};
    $('method-hint').textContent = hints[method];
  }

  renderMatrix(data) {
    const n = data.a.length;
    const toolbar = element('div', {class: 'editor-toolbar'});
    toolbar.append(element('label', {for: 'dimension'}, 'Tamanho do sistema'));
    const size = element('select', {id: 'dimension'});
    for (let i=2; i<=12; i++) size.append(element('option', {value: i}, `${i} × ${i}`));
    size.value = String(n);
    size.addEventListener('change', () => {
      const m = Number(size.value);
      const raw = this.rawMatrix();
      this.render({...this.data, a: Array.from({length:m},(_,i)=>Array.from({length:m},(_,j)=>raw.a[i]?.[j] ?? (i===j?1:0))),
        b: Array.from({length:m},(_,i)=>raw.b[i]??0), rotulos: null, linhas: null, inicial: null}, this.method);
      this.onChange(true);
    });
    toolbar.append(size); this.root.append(toolbar);
    const scroll = element('div', {class: 'table-scroll'});
    const matrix = element('table', {class: 'data-table matrix-editor'});
    const head = element('tr'); head.append(element('th', {}, ''));
    for (let j=0;j<n;j++) head.append(element('th', {scope:'col'}, data.rotulos?.[j] || `x${j+1}`));
    head.append(element('th', {scope:'col'}, 'b'));
    const thead = element('thead'); thead.append(head); matrix.append(thead);
    const body = element('tbody');
    for(let i=0;i<n;i++) {
      const row=element('tr'); row.append(element('th', {scope:'row', class:'row-label'}, data.linhas?.[i]||`L${i+1}`));
      for(let j=0;j<n;j++) {const td=element('td');td.append(field(data.a[i][j], `Coeficiente linha ${i+1}, coluna ${j+1}`, {'data-a':`${i},${j}`}));row.append(td);}
      const rhs=element('td'); rhs.append(field(data.b[i], `Termo independente linha ${i+1}`, {'data-b':i,class:'rhs'}));row.append(rhs);body.append(row);
    }
    matrix.append(body);scroll.append(matrix);this.root.append(scroll);
    this.root.append(element('p',{class:'field-hint'},'Edite qualquer célula. A coluna verde é o vetor b. Use Tab para avançar entre os valores.'));
  }

  renderPoints(data) {
    const toolbar=element('div',{class:'editor-toolbar'});toolbar.append(element('label',{},'Pontos da tabela'));
    toolbar.append(element('span',{class:'badge'},`${data.xs.length} pontos`));this.root.append(toolbar);
    const scroll=element('div',{class:'table-scroll'}), matrix=element('table',{class:'data-table point-editor'});
    const thead=element('thead'), head=element('tr');
    ['#',data.eixo_x||'x',data.eixo_y||'y',''].forEach(t=>head.append(element('th',{scope:'col'},t)));thead.append(head);matrix.append(thead);
    const body=element('tbody');
    data.xs.forEach((x,i)=>{
      const row=element('tr');row.append(element('th',{scope:'row',class:'row-label'},String(i+1).padStart(2,'0')));
      for(const [key,value] of [['x',x],['y',data.ys[i]]]) {const td=element('td');td.append(field(value,`${key} do ponto ${i+1}`,{[`data-${key}`]:i}));row.append(td);}
      const td=element('td'), remove=element('button',{type:'button',class:'remove-point','aria-label':`Remover ponto ${i+1}`},'×');
      remove.disabled=data.xs.length<=2;
      remove.addEventListener('click',()=>{const current=this.rawPoints();current.xs.splice(i,1);current.ys.splice(i,1);this.render({...this.data,...this.rawOptions(),...current},this.method);this.onChange();});
      td.append(remove);row.append(td);body.append(row);
    });
    matrix.append(body);scroll.append(matrix);this.root.append(scroll);
    const actions=element('div',{class:'editor-actions'}), add=element('button',{type:'button',class:'tiny-button'},'＋ Adicionar ponto');
    add.disabled=data.xs.length>=100;
    add.addEventListener('click',()=>{const current=this.rawPoints();const last=Number(String(current.xs.at(-1)).replace(',','.'));const prev=Number(String(current.xs.at(-2)).replace(',','.'));current.xs.push(Number.isFinite(last)&&Number.isFinite(prev)?last+(last-prev):'');current.ys.push('');this.render({...this.data,...this.rawOptions(),...current},this.method);this.onChange();this.root.querySelector('[data-y]:last-of-type')?.focus();});
    actions.append(add,element('span',{class:'field-hint'},'Vírgula ou ponto decimal'));this.root.append(actions);
  }

  renderIterationOptions(data) {
    const options=element('div',{class:'two-fields'});
    const tol=element('label',{},'Tolerância do resíduo');tol.append(field(data.tolerancia??0.0001,'Tolerância',{id:'tolerance'}));
    const limit=element('label',{},'Limite de iterações');limit.append(field(data.max_iteracoes??2000,'Limite de iterações',{id:'iterations'}));options.append(tol,limit);this.root.append(options);
    const normal=element('label',{class:'checkbox'}), check=element('input',{type:'checkbox',id:'normal-equations'});check.checked=Boolean(data.normais);
    normal.append(check,document.createTextNode('Iterar nas equações normais AᵀA x = Aᵀb'));this.root.append(normal);
    const detail=element('details',{class:'paste-details'});detail.append(element('summary',{},'Aproximação inicial (opcional)'));
    const label=element('label',{for:'initial'},'Valores separados por ponto e vírgula');detail.append(label);
    const input=element('input',{type:'text',id:'initial',value:data.inicial?.join('; ')||'',placeholder:'Vazio = vetor zero'});detail.append(input);this.root.append(detail);
  }

  renderInterpolationOptions(data) {
    const options=element('div',{class:'two-fields'});
    const target=element('label',{},'Estimar em x =');target.append(field(data.alvo??1.15,'Alvo da interpolação',{id:'target'}));
    const degree=element('label',{},'Grau do polinômio'), select=element('select',{id:'degree','aria-label':'Grau do polinômio'});
    for(let i=2;i<=4;i++) select.append(element('option',{value:i},`Grau ${i} · ${i+1} nós`));
    select.value=String(data.grau??2);select.addEventListener('change',()=>this.onChange());degree.append(select);options.append(target,degree);this.root.append(options);
  }

  rawOptions() {
    const data={};
    if($('target')){data.alvo=$('target').value;data.grau=Number($('degree').value);}
    if($('tolerance')){data.tolerancia=$('tolerance').value;data.max_iteracoes=$('iterations').value;data.normais=$('normal-equations').checked;
      data.inicial=$('initial').value.trim()?$('initial').value.split(';').map(v=>v.trim()):null;}
    return data;
  }
  rawMatrix() {
    const n=this.root.querySelectorAll('[data-b]').length;
    const a=Array.from({length:n},()=>Array(n));
    this.root.querySelectorAll('[data-a]').forEach(input=>{const [i,j]=input.dataset.a.split(',').map(Number);a[i][j]=input.value;});
    return {a,b:[...this.root.querySelectorAll('[data-b]')].map(input=>input.value)};
  }
  rawPoints(){return {xs:[...this.root.querySelectorAll('[data-x]')].map(input=>input.value),ys:[...this.root.querySelectorAll('[data-y]')].map(input=>input.value)};}
  read() {
    const options=this.rawOptions();
    const values=groupOf(this.method)==='sistema'?this.rawMatrix():this.rawPoints();
    this.root.querySelectorAll('input[type=text]').forEach(input=>{
      if(input.id==='initial')return;
      try{numeric(input.value,input.getAttribute('aria-label'));input.removeAttribute('aria-invalid');}
      catch(error){input.setAttribute('aria-invalid','true');}
    });
    const invalid=this.root.querySelector('[aria-invalid=true]');
    if(invalid){invalid.focus();throw new Error(`${invalid.getAttribute('aria-label')}: preencha um número válido.`);}
    const result={...structuredClone(this.data),...values,...options,metodo:this.method};
    if(result.a){result.a=result.a.map(row=>row.map(v=>numeric(v)));result.b=result.b.map(v=>numeric(v));}
    if(result.xs){result.xs=result.xs.map(v=>numeric(v));result.ys=result.ys.map(v=>numeric(v));}
    if(options.inicial)result.inicial=options.inicial.map(v=>numeric(v,'Aproximação inicial'));
    return result;
  }
  applyPaste() {
    try {
      const lines=$('paste-data').value.trim().split(/\r?\n/).filter(line=>line.trim());
      const rows=lines.map(line=>line.trim().split(/[;\t]/).map(v=>numeric(v,'Tabela colada')));
      const system=groupOf(this.method)==='sistema';
      if(system && (rows.length<2||rows.length>12||rows.some(row=>row.length!==rows.length+1)))throw new Error('Cole uma matriz n × (n+1): coeficientes e b na última coluna.');
      if(!system && (rows.length<2||rows.length>100||rows.some(row=>row.length!==2)))throw new Error('Cole de 2 a 100 linhas com duas colunas: x; y.');
      const data=system?{a:rows.map(row=>row.slice(0,-1)),b:rows.map(row=>row.at(-1)),rotulos:null,linhas:null,inicial:null}
        :{xs:rows.map(row=>row[0]),ys:rows.map(row=>row[1])};
      this.render({...this.data,...this.rawOptions(),...data},this.method);this.onChange(true);$('paste-data').value='';
    }catch(error){this.onError(error.message);}
  }
}
