"use client";

import { useAtlasLanguage } from "../i18n/AtlasLanguage";
import styles from "./Quality.module.css";

const copy = {
  ru: {
    kicker:"Национальный AMR surveillance", title:"Качество и охват", subtitle:"Оценка пригодности лабораторных данных для региональной и национальной интерпретации AMR.", demo:"PROTOTYPE · demo data",
    metrics:[['Территории с данными','18 / 20'],['Активные лаборатории','86'],['Интерпретируемый AST','94,1%'],['Отклонённые записи','2,4%'],['Кандидаты в дубли','1,8%']],
    readiness:"Готовность данных · demo", readinessText:"Пример того, как Atlas будет показывать пригодность набора к интерпретации. Эти значения не являются показателями Казахстана.",
    bars:[['Географический охват','18 / 20 demo',90],['Полнота обязательных полей','96,4% demo',96.4],['Своевременность передачи','91,2% demo',91.2],['Интерпретируемый AST','94,1% demo',94.1]],
    control:"Контроль качества surveillance", controlText:"Каждый агрегат в production должен сопровождаться этими измерениями качества.",
    rows:[['Географический охват','N + labs + territories','настроено',false],['Полнота обязательных полей','required fields','настроено',false],['Своевременность передачи','last load + delay','обязательно',false],['Дедупликация','rule version + duplicates','обязательно',false],['Breakpoint standard','EUCAST / CLSI + version','обязательно',false],['Участие в EQA','participation / result','планируется',true],['Blood culture rate','per 1000 patient-days','планируется',true]],
    note:"Для Казахстана качество и охват должны быть равноправны с AMR-показателями: высокий R% без N, лабораторного покрытия и QC-контекста не должен трактоваться как национальная оценка."
  },
  kk: {
    kicker:"Ұлттық AMR surveillance", title:"Сапа және қамту", subtitle:"Зертханалық деректердің өңірлік және ұлттық AMR интерпретациясына жарамдылығын бағалау.", demo:"PROTOTYPE · demo data",
    metrics:[['Дерегі бар аумақтар','18 / 20'],['Белсенді зертханалар','86'],['Интерпретацияланатын AST','94,1%'],['Қабылданбаған жазбалар','2,4%'],['Ықтимал дубльдер','1,8%']],
    readiness:"Деректер дайындығы · demo", readinessText:"Atlas деректер жиынының интерпретацияға жарамдылығын қалай көрсететінінің мысалы. Бұл мәндер Қазақстан көрсеткіштері емес.",
    bars:[['Географиялық қамту','18 / 20 demo',90],['Міндетті өрістердің толықтығы','96,4% demo',96.4],['Деректерді уақытылы беру','91,2% demo',91.2],['Интерпретацияланатын AST','94,1% demo',94.1]],
    control:"Surveillance сапасын бақылау", controlText:"Production режимінде әр агрегат осы сапа өлшемдерімен бірге жүруі тиіс.",
    rows:[['Географиялық қамту','N + labs + territories','бапталған',false],['Міндетті өрістердің толықтығы','required fields','бапталған',false],['Деректерді уақытылы беру','last load + delay','міндетті',false],['Дедупликация','rule version + duplicates','міндетті',false],['Breakpoint standard','EUCAST / CLSI + version','міндетті',false],['EQA-ға қатысу','participation / result','жоспарда',true],['Blood culture rate','per 1000 patient-days','жоспарда',true]],
    note:"Қазақстан үшін сапа мен қамту AMR көрсеткіштерімен тең дәрежеде маңызды: N, зертханалық қамту және QC контексті жоқ жоғары R% ұлттық баға ретінде түсіндірілмеуі керек."
  },
  en: {
    kicker:"National AMR surveillance", title:"Quality & coverage", subtitle:"Assessment of whether laboratory data are fit for regional and national AMR interpretation.", demo:"PROTOTYPE · demo data",
    metrics:[['Territories with data','18 / 20'],['Active laboratories','86'],['Interpretable AST','94.1%'],['Rejected records','2.4%'],['Duplicate candidates','1.8%']],
    readiness:"Data readiness · demo", readinessText:"Example of how Atlas will communicate fitness for interpretation. These values are not Kazakhstan indicators.",
    bars:[['Geographic coverage','18 / 20 demo',90],['Required-field completeness','96.4% demo',96.4],['Reporting timeliness','91.2% demo',91.2],['Interpretable AST','94.1% demo',94.1]],
    control:"Surveillance quality control", controlText:"In production, every aggregate should be accompanied by these quality dimensions.",
    rows:[['Geographic coverage','N + labs + territories','configured',false],['Required-field completeness','required fields','configured',false],['Reporting timeliness','last load + delay','required',false],['Deduplication','rule version + duplicates','required',false],['Breakpoint standard','EUCAST / CLSI + version','required',false],['EQA participation','participation / result','planned',true],['Blood culture rate','per 1000 patient-days','planned',true]],
    note:"For Kazakhstan, quality and coverage should be as prominent as AMR metrics: a high R% without N, laboratory coverage and QC context must not be interpreted as a national estimate."
  }
} as const;

export default function QualityPage(){
  const { language } = useAtlasLanguage();
  const t = copy[language];
  return <main className={styles.page}>
    <header className={styles.head}><div><small>{t.kicker}</small><h1>{t.title}</h1><p>{t.subtitle}</p></div><span className={styles.badge}>{t.demo}</span></header>
    <section className={styles.metrics}>{t.metrics.map(([label,value])=><article className={styles.metric} key={label}><span>{label}</span><strong>{value}</strong><small>demo</small></article>)}</section>
    <section className={styles.grid}>
      <article className={styles.card}><h2>{t.readiness}</h2><p>{t.readinessText}</p><div className={styles.bars}>{t.bars.map(([label,value,width])=><div key={String(label)}><div className={styles.barLabel}><span>{label}</span><b>{value}</b></div><div className={styles.bar}><i style={{width:`${width}%`}}/></div></div>)}</div></article>
      <article className={styles.card}><h2>{t.control}</h2><p>{t.controlText}</p><div className={styles.dimensions}>{t.rows.map(([label,detail,status,planned])=><div className={styles.row} key={String(label)}><span>{label}</span><b>{detail}</b><em data-planned={planned ? "true" : "false"}>{status}</em></div>)}</div></article>
    </section>
    <div className={styles.note}><strong>QC:</strong> {t.note}</div>
  </main>;
}
