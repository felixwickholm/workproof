/**
 * Finnish match terms. Finnish builds compounds and inflects words ("potilasturvallisuus",
 * "tietokannat"), so these match anywhere inside a word. Every other term matches whole words only.
 * Terms with ä, ö or å count as Finnish without being listed.
 */
const FINNISH_STEMS: ReadonlySet<string> = new Set([
  "koodikatselmointi", "rajapinta", "tietomalli", "tietokanta", "testaus", "tietoturva", "suorituskyky", "saavutettavuus",
  "mobiili", "koneoppiminen", "datan laatu", "tilastotiede", "valvonta", "sulautettu", "sulautetut", "sulautettujen",
  "turvallisuus", "laadunvarmistus", "priorisointi", "riskienhallinta", "suunnittelu", "aikataulu", "kirjoittaminen",
  "dokumentaatio", "dokumentointi", "myynti", "asiakas", "kirjanpito", "alv", "tietosuoja", "markkinointi", "potilas",
  "opetus", "pedagogiikka", "ohjelmistoinsinööri", "koodari", "mobiilisovellus", "koneoppimisinsinööri", "kielimalli",
  "data-insinööri", "datainsinööri", "tietovarasto", "datatiede", "ennustemalli", "ennustaminen", "ylläpito",
  "palvelinylläpito", "kyberturvallisuus", "robotiikka", "robotiikkainsinööri", "testaaja", "testausautomaatio",
  "testausinsinööri", "tuoteomistaja", "tuotekehitys", "projektinhallinta", "projektikoordinaattori", "palvelumuotoilija",
  "data-analyytikko", "data analyytikko", "analyytikko", "tietoanalyytikko", "pilviarkkitehti", "pilviarkkitehtuuri",
  "ratkaisuarkkitehti", "kvanttitutkija", "kvanttilaskenta", "tutkija", "fyysikko", "ratkaisumyynti", "myyntiinsinööri",
  "tekninen myynti", "tekninen kirjoittaja", "taloushallinto", "tilitoimisto", "markkinoija", "hoitaja", "opettaja",
  "luokanopettaja", "aineenopettaja", "lehtori", "pilvi", "arkkitehtuuri", "kvantti", "tutkimus", "raportointi", "analytiikka",
]);

export function isFinnishStem(term: string): boolean {
  return /[äöå]/.test(term) || FINNISH_STEMS.has(term);
}
