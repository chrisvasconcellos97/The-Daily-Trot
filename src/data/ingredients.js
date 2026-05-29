export function normalize(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let s = raw.toLowerCase().trim()
  s = s.replace(/\([^)]*\)/g, ' ')
  s = s.replace(/\b\d+(\.\d+)?\s?%/g, ' ')
  s = s.replace(/[^a-z0-9\s-]/g, ' ')
  s = s.replace(/\s+/g, ' ').trim()
  s = s.replace(/\s/g, '_')
  if (/^ci_\d+$/.test(s)) return '__colorant__'
  return s
}

export const ORGANIC_MARKERS = ['organic', 'usda_organic', 'certified_organic', 'non_gmo', 'non-gmo']

const RAW = {
  // AVOID
  formaldehyde: { tier:'avoid', reason:'Known human carcinogen', aliases:['formalin','methanal'] },
  dmdm_hydantoin: { tier:'avoid', reason:'Releases formaldehyde — carcinogen link' },
  diazolidinyl_urea: { tier:'avoid', reason:'Releases formaldehyde' },
  imidazolidinyl_urea: { tier:'avoid', reason:'Releases formaldehyde' },
  quaternium_15: { tier:'avoid', reason:'Releases formaldehyde', aliases:['quaternium-15'] },
  bronopol: { tier:'avoid', reason:'Releases formaldehyde' },
  propylparaben: { tier:'avoid', reason:'Endocrine disruptor' },
  butylparaben: { tier:'avoid', reason:'Endocrine disruptor' },
  isopropylparaben: { tier:'avoid', reason:'Endocrine disruptor' },
  isobutylparaben: { tier:'avoid', reason:'Endocrine disruptor' },
  triclosan: { tier:'avoid', reason:'Endocrine disruptor, banned in OTC soaps' },
  triclocarban: { tier:'avoid', reason:'Endocrine disruptor, banned in OTC soaps' },
  hydroquinone: { tier:'avoid', reason:'Possible carcinogen, banned OTC' },
  coal_tar: { tier:'avoid', reason:'Known carcinogen', aliases:['coal tar'] },
  lead_acetate: { tier:'avoid', reason:'Heavy-metal neurotoxin, FDA banned' },
  thimerosal: { tier:'avoid', reason:'Mercury compound — neurotoxin', aliases:['mercury','calomel','mercurous chloride'] },
  toluene: { tier:'avoid', reason:'Reproductive toxin', aliases:['methylbenzene'] },
  benzene: { tier:'avoid', reason:'Known carcinogen' },
  butylated_hydroxyanisole: { tier:'avoid', reason:'BHA — possible carcinogen, Prop 65', aliases:['bha'] },
  bht: { tier:'avoid', reason:'Possible endocrine disruptor' },
  oxybenzone: { tier:'avoid', reason:'Endocrine disruptor, coral toxic', aliases:['benzophenone-3'] },
  octinoxate: { tier:'avoid', reason:'Endocrine disruptor', aliases:['octyl methoxycinnamate'] },
  diethyl_phthalate: { tier:'avoid', reason:'Endocrine disruptor', aliases:['dep','phthalate'] },
  dibutyl_phthalate: { tier:'avoid', reason:'Endocrine disruptor', aliases:['dbp'] },
  ptfe: { tier:'avoid', reason:'PFAS — persistent forever chemical', aliases:['perfluoro','polytetrafluoroethylene'] },
  retinyl_palmitate: { tier:'avoid', reason:'Photo-carcinogenicity concern on skin' },
  resorcinol: { tier:'avoid', reason:'Endocrine disruptor, strong allergen' },
  p_phenylenediamine: { tier:'avoid', reason:'PPD — severe allergen, hair dye', aliases:['ppd'] },
  methylisothiazolinone: { tier:'avoid', reason:'Potent skin sensitizer, banned leave-on EU', aliases:['mit'] },
  methylchloroisothiazolinone: { tier:'avoid', reason:'Potent skin sensitizer', aliases:['cmit'] },
  red_3: { tier:'avoid', reason:'FDA-banned dye (carcinogen)', aliases:['ci 45430','erythrosine'] },
  potassium_bromate: { tier:'avoid', reason:'Probable carcinogen, banned in EU/Canada' },
  brominated_vegetable_oil: { tier:'avoid', reason:'FDA banned 2024', aliases:['bvo'] },
  partially_hydrogenated_oil: { tier:'avoid', reason:'Artificial trans fat', aliases:['partially hydrogenated'] },
  sodium_nitrite: { tier:'avoid', reason:'Nitrosamine carcinogen risk in processed meat', aliases:['sodium nitrate'] },
  benzalkonium_chloride: { tier:'avoid', reason:'Quat — asthma risk, resistance concern' },
  sodium_hypochlorite: { tier:'avoid', reason:'Bleach — respiratory hazard in cleaners' },
  nonylphenol_ethoxylate: { tier:'avoid', reason:'Endocrine disruptor', aliases:['npe'] },
  // CAUTION
  fragrance: { tier:'caution', reason:'Undisclosed mix — common allergen in children', aliases:['parfum','perfume','aroma'] },
  sodium_lauryl_sulfate: { tier:'caution', reason:'Irritant surfactant', aliases:['sls'], categoryOverride:{'cosmetic-rinseoff':'safe'} },
  sodium_laureth_sulfate: { tier:'caution', reason:'Irritant, may carry trace 1,4-dioxane', aliases:['sles'], categoryOverride:{'cosmetic-rinseoff':'safe'} },
  cocamidopropyl_betaine: { tier:'caution', reason:'Surfactant irritant in leave-on products', categoryOverride:{'cosmetic-rinseoff':'safe'} },
  peg_compound: { tier:'caution', reason:'May carry trace 1,4-dioxane', aliases:['polyethylene glycol'] },
  phenoxyethanol: { tier:'caution', reason:'Preservative — exposure limits for infants' },
  propylene_glycol: { tier:'caution', reason:'Possible skin irritant at high concentrations' },
  triethanolamine: { tier:'caution', reason:'DEA/TEA — possible nitrosamines', aliases:['tea','dea','mea','diethanolamine'] },
  __colorant__: { tier:'caution', reason:'Synthetic dye' },
  yellow_5: { tier:'caution', reason:'Linked to hyperactivity in children', aliases:['tartrazine','ci 19140'] },
  yellow_6: { tier:'caution', reason:'Linked to hyperactivity in children', aliases:['ci 15985','sunset yellow'] },
  red_40: { tier:'caution', reason:'Linked to hyperactivity in children', aliases:['allura red','ci 16035'] },
  blue_1: { tier:'caution', reason:'Synthetic dye', aliases:['ci 42090','brilliant blue'] },
  aluminum_compound: { tier:'caution', reason:'Antiperspirant salt — absorption debate', aliases:['aluminum chlorohydrate','aluminum zirconium'] },
  talc: { tier:'caution', reason:'Possible asbestos contamination in cosmetic grade' },
  high_fructose_corn_syrup: { tier:'caution', reason:'Ultra-processed added sugar', aliases:['hfcs','corn syrup'] },
  aspartame: { tier:'caution', reason:'Artificial sweetener — IARC possible carcinogen 2023' },
  sucralose: { tier:'caution', reason:'Artificial sweetener' },
  acesulfame_potassium: { tier:'caution', reason:'Artificial sweetener', aliases:['acesulfame k','ace-k'] },
  monosodium_glutamate: { tier:'caution', reason:'Flavor enhancer — sensitivity in some individuals', aliases:['msg'] },
  carrageenan: { tier:'caution', reason:'Possible gut irritant' },
  caramel_color: { tier:'caution', reason:'May contain 4-MEI (Prop 65 carcinogen)' },
  titanium_dioxide: { tier:'caution', reason:'Banned as food additive in EU; inhalation concern in powder form' },
  mineral_oil: { tier:'caution', reason:'Petroleum-derived; refinement quality varies', aliases:['petrolatum','paraffinum liquidum','white mineral oil'] },
  natural_flavors: { tier:'caution', reason:'Undisclosed additive blend' },
  dimethicone: { tier:'caution', reason:'Silicone — non-biodegradable, occlusive' },
  linalool: { tier:'caution', reason:'EU-listed fragrance allergen' },
  limonene: { tier:'caution', reason:'EU-listed fragrance allergen' },
  citronellol: { tier:'caution', reason:'EU-listed fragrance allergen' },
  geraniol: { tier:'caution', reason:'EU-listed fragrance allergen' },
  // SAFE
  water: { tier:'safe', reason:'Inert base', aliases:['aqua','eau'] },
  glycerin: { tier:'safe', reason:'Gentle humectant', aliases:['glycerine','vegetable glycerin'] },
  aloe_vera: { tier:'safe', reason:'Soothing botanical', aliases:['aloe barbadensis'] },
  shea_butter: { tier:'safe', reason:'Natural emollient', aliases:['butyrospermum parkii'] },
  coconut_oil: { tier:'safe', reason:'Naturally derived', aliases:['cocos nucifera'] },
  jojoba_oil: { tier:'safe', reason:'Naturally derived', aliases:['simmondsia chinensis'] },
  tocopherol: { tier:'safe', reason:'Vitamin E antioxidant', aliases:['vitamin e','tocopheryl acetate'] },
  ascorbic_acid: { tier:'safe', reason:'Vitamin C antioxidant', aliases:['vitamin c','sodium ascorbate'] },
  citric_acid: { tier:'safe', reason:'Mild natural pH adjuster' },
  sodium_benzoate: { tier:'safe', reason:'Accepted clean preservative' },
  potassium_sorbate: { tier:'safe', reason:'Accepted clean preservative' },
  sodium_bicarbonate: { tier:'safe', reason:'Baking soda — benign', aliases:['baking soda'] },
  zinc_oxide: { tier:'safe', reason:'Mineral UV filter — no absorption concern' },
  beeswax: { tier:'safe', reason:'Natural wax', aliases:['cera alba'] },
  hyaluronic_acid: { tier:'safe', reason:'Skin-identical humectant', aliases:['sodium hyaluronate'] },
  xanthan_gum: { tier:'safe', reason:'Natural thickener' },
  olive_oil: { tier:'safe', reason:'Naturally derived', aliases:['olea europaea'] },
  oat: { tier:'safe', reason:'Soothing botanical', aliases:['avena sativa','colloidal oatmeal'] },
  sunflower_oil: { tier:'safe', reason:'Naturally derived', aliases:['helianthus annuus'] },
  organic: { tier:'safe', reason:'Certified organic marker', aliases:['usda organic','certified organic'] },
}

function buildIndex(raw) {
  const index = {}
  for (const [canonical, entry] of Object.entries(raw)) {
    const norm = normalize(canonical)
    index[norm] = { canonical: norm, ...entry }
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        const aliasNorm = normalize(alias)
        if (!index[aliasNorm]) index[aliasNorm] = { canonical: norm, ...entry }
      }
    }
  }
  return index
}

export const INGREDIENTS = buildIndex(RAW)
