export interface HSNCode {
  code: string;
  description: string;
  gstRate: number; // percent
  category: string;
  examples: string;
}

export const HSN_CODES: HSNCode[] = [
  // Steel & Metals
  { code: '7208', description: 'Flat-rolled products of iron/non-alloy steel, hot-rolled, not clad/plated/coated', gstRate: 18, category: 'Steel & Metals', examples: 'HR coils, HR plates, HR strips' },
  { code: '7209', description: 'Flat-rolled products of iron/non-alloy steel, cold-rolled (cold-reduced), not clad', gstRate: 18, category: 'Steel & Metals', examples: 'CR coils, CR sheets, CR strips' },
  { code: '7210', description: 'Flat-rolled products of iron/non-alloy steel, clad/plated/coated', gstRate: 18, category: 'Steel & Metals', examples: 'Galvanised sheets, colour-coated sheets, GI coils' },
  { code: '7213', description: 'Bars and rods, hot-rolled, in irregularly wound coils, of iron/non-alloy steel', gstRate: 18, category: 'Steel & Metals', examples: 'Wire rods, coil bars' },
  { code: '7214', description: 'Other bars and rods of iron or non-alloy steel, not further worked than forged/hot-rolled', gstRate: 18, category: 'Steel & Metals', examples: 'TMT bars (Fe 415, Fe 500, Fe 550), MS bars, rebars' },
  { code: '7216', description: 'Angles, shapes and sections of iron or non-alloy steel', gstRate: 18, category: 'Steel & Metals', examples: 'MS angles, channels, I-beams, H-beams, MS flats' },
  { code: '7219', description: 'Flat-rolled products of stainless steel, width ≥ 600mm', gstRate: 18, category: 'Steel & Metals', examples: 'SS coils, SS sheets, SS plates (304, 316, 202 grade)' },
  { code: '7306', description: 'Other tubes, pipes and hollow profiles of iron or steel', gstRate: 18, category: 'Steel & Metals', examples: 'MS pipes (ERW), GI pipes, hollow sections, MS tubes' },
  { code: '7601', description: 'Unwrought aluminium', gstRate: 18, category: 'Steel & Metals', examples: 'Aluminium ingots, billets, T-bars' },
  { code: '7607', description: 'Aluminium foil (whether or not printed/backed)', gstRate: 18, category: 'Steel & Metals', examples: 'Aluminium foil rolls, packaging foil' },
  { code: '7403', description: 'Refined copper and copper alloys, unwrought', gstRate: 18, category: 'Steel & Metals', examples: 'Copper cathodes, brass ingots, bronze billets' },
  { code: '7408', description: 'Copper wire', gstRate: 18, category: 'Steel & Metals', examples: 'Bare copper wire, tinned copper wire, enamelled copper wire' },
  // Packaging
  { code: '4819', description: 'Cartons, boxes and cases of corrugated paper or paperboard', gstRate: 12, category: 'Packaging', examples: 'Corrugated boxes (3-ply, 5-ply, 7-ply), mono cartons, display boxes' },
  { code: '3920', description: 'Other plates/sheets/film/foil/strip of plastics, non-cellular, not reinforced', gstRate: 18, category: 'Packaging', examples: 'BOPP film, PET film, CPP film, shrink film' },
  { code: '3923', description: 'Articles for conveyance or packing of goods, of plastics', gstRate: 18, category: 'Packaging', examples: 'Plastic containers, PET bottles, caps, closures, crates' },
  { code: '6305', description: 'Sacks and bags, of a kind used for the packing of goods', gstRate: 5, category: 'Packaging', examples: 'Jute bags, HDPE woven bags, PP bags, FIBCs (jumbo bags)' },
  { code: '3919', description: 'Self-adhesive plates, sheets, film, foil, tape, strip and other flat shapes, of plastics', gstRate: 18, category: 'Packaging', examples: 'BOPP tape, stretch tape, warning tape, foam tape' },
  { code: '4811', description: 'Paper and paperboard, coated, impregnated or surface-coated', gstRate: 12, category: 'Packaging', examples: 'Kraft liner, test liner, duplex board, white kraft' },
  { code: '3917', description: 'Tubes, pipes and hoses, and fittings thereof, of plastics', gstRate: 18, category: 'Packaging', examples: 'HDPE pipes, PVC pipes, corrugated conduit pipes, irrigation pipes' },
  // Chemicals
  { code: '2901', description: 'Acyclic hydrocarbons', gstRate: 18, category: 'Chemicals', examples: 'Hexane, heptane, pentane, propylene, ethylene' },
  { code: '2902', description: 'Cyclic hydrocarbons', gstRate: 18, category: 'Chemicals', examples: 'Toluene, xylene, benzene, cyclohexane' },
  { code: '2905', description: 'Acyclic alcohols and their halogenated, sulphonated, nitrated or nitrosated derivatives', gstRate: 18, category: 'Chemicals', examples: 'Methanol, ethanol, IPA (isopropyl alcohol), butanol' },
  { code: '2814', description: 'Ammonia, anhydrous or in aqueous solution', gstRate: 18, category: 'Chemicals', examples: 'Liquid ammonia, ammonia solution (ammonium hydroxide)' },
  { code: '2815', description: 'Sodium hydroxide (caustic soda); potassium hydroxide (caustic potash)', gstRate: 18, category: 'Chemicals', examples: 'Caustic soda flakes, caustic soda lye, caustic potash' },
  { code: '2807', description: 'Sulphuric acid; oleum', gstRate: 18, category: 'Chemicals', examples: 'Sulphuric acid (H2SO4), oleum, battery acid' },
  { code: '2806', description: 'Hydrogen chloride (hydrochloric acid); chlorosulphuric acid', gstRate: 18, category: 'Chemicals', examples: 'Hydrochloric acid (HCl), muriatic acid' },
  { code: '3506', description: 'Prepared glues and other prepared adhesives', gstRate: 18, category: 'Chemicals / Adhesives', examples: 'Epoxy adhesives, PU adhesives, cyanoacrylate (super glue), hot melt adhesives, contact cement' },
  { code: '3214', description: 'Glaziers\'s putty, grafting putty, resin cements, caulking compounds and other mastics', gstRate: 18, category: 'Chemicals / Adhesives', examples: 'Silicone sealants, polyurethane sealants, construction sealants, caulking compounds' },
  { code: '3208', description: 'Paints and varnishes based on synthetic polymers dissolved in non-aqueous medium', gstRate: 18, category: 'Paints', examples: 'Epoxy paints, polyurethane paints, alkyd enamels, industrial coatings' },
  { code: '3209', description: 'Paints and varnishes based on synthetic polymers dispersed in aqueous medium', gstRate: 18, category: 'Paints', examples: 'Water-based paints, emulsion paints, latex paints, acrylic distemper' },
  { code: '3210', description: 'Other paints and varnishes', gstRate: 18, category: 'Paints', examples: 'Zinc chromate primers, red oxide primers, bituminous coatings' },
  // Plastics & Rubber
  { code: '3901', description: 'Polymers of ethylene, in primary forms', gstRate: 18, category: 'Plastics', examples: 'HDPE granules, LDPE granules, LLDPE granules, mLLDPE' },
  { code: '3902', description: 'Polymers of propylene or other olefins, in primary forms', gstRate: 18, category: 'Plastics', examples: 'PP granules (homopolymer, copolymer), polypropylene compounds' },
  { code: '3904', description: 'Polymers of vinyl chloride or other halogenated olefins, in primary forms', gstRate: 18, category: 'Plastics', examples: 'PVC resin, PVC compound, CPVC, rigid/flexible PVC' },
  { code: '3907', description: 'Polyacetals, other polyethers and epoxide resins; polycarbonates; alkyd resins', gstRate: 18, category: 'Plastics', examples: 'PET chips, polycarbonate pellets, epoxy resin, POM acetal' },
  { code: '4001', description: 'Natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums', gstRate: 5, category: 'Rubber', examples: 'Natural rubber (RSS, TSR grades), latex concentrate' },
  { code: '4002', description: 'Synthetic rubber and factice derived from oils', gstRate: 18, category: 'Rubber', examples: 'SBR, NBR, EPDM, neoprene, butyl rubber, silicone rubber' },
  { code: '4016', description: 'Other articles of vulcanised rubber other than hard rubber', gstRate: 18, category: 'Rubber', examples: 'Rubber seals, O-rings, rubber mats, gaskets, rubber hoses' },
  // Machinery
  { code: '8413', description: 'Pumps for liquids, whether or not fitted with a measuring device', gstRate: 12, category: 'Machinery', examples: 'Centrifugal pumps, submersible pumps, gear pumps, monoblock pumps' },
  { code: '8414', description: 'Air or vacuum pumps, air or gas compressors', gstRate: 12, category: 'Machinery', examples: 'Air compressors, vacuum pumps, industrial blowers, air coolers' },
  { code: '8428', description: 'Other lifting, handling, loading or unloading machinery', gstRate: 18, category: 'Machinery', examples: 'Conveyors, lifts, hoists, cranes, forklifts, stackers' },
  { code: '8479', description: 'Machines and mechanical appliances having individual functions, not specified elsewhere', gstRate: 18, category: 'Machinery', examples: 'Industrial mixers, extruders, industrial robots, spray machines' },
  { code: '8501', description: 'Electric motors and generators (excluding generating sets)', gstRate: 18, category: 'Electrical', examples: 'AC motors, DC motors, servo motors, stepper motors, alternators' },
  { code: '8537', description: 'Boards, panels, consoles, desks, cabinets and other bases, for electric control or distribution', gstRate: 18, category: 'Electrical', examples: 'MCC panels, PCC panels, distribution boards, control panels, switchboards' },
  // Electronics
  { code: '8517', description: 'Telephone sets; apparatus for transmission/reception of voice/images/data', gstRate: 18, category: 'Electronics', examples: 'Mobile phones, networking equipment, routers, switches, modems' },
  { code: '8542', description: 'Electronic integrated circuits', gstRate: 0, category: 'Electronics', examples: 'ICs, microcontrollers, semiconductors, processors, memory chips' },
  { code: '8544', description: 'Insulated wire, cable and other insulated electric conductors', gstRate: 18, category: 'Electricals', examples: 'Electrical cables (PVC/FR/XLPE), winding wires, coaxial cables, LAN cables' },
  // Textiles
  { code: '5208', description: 'Woven fabrics of cotton, containing ≥85% by weight of cotton, weighing ≤200g/m²', gstRate: 5, category: 'Textiles', examples: 'Cotton shirting fabric, cotton poplin, cambric, voile' },
  { code: '5210', description: 'Woven fabrics of cotton, containing <85% by weight of cotton mixed with synthetic fibres, ≤200g/m²', gstRate: 5, category: 'Textiles', examples: 'Cotton-polyester blended fabric, T/C fabric, CVC fabric' },
  { code: '5407', description: 'Woven fabrics of synthetic filament yarn', gstRate: 5, category: 'Textiles', examples: 'Polyester fabric, nylon fabric, viscose fabric, georgette, chiffon' },
  { code: '5205', description: 'Cotton yarn (other than sewing thread)', gstRate: 5, category: 'Textiles', examples: 'Carded cotton yarn, combed cotton yarn (count: 20s to 120s)' },
  // Food
  { code: '1001', description: 'Wheat and meslin', gstRate: 0, category: 'Food', examples: 'Wheat (all varieties), meslin (wheat-rye mix)' },
  { code: '1006', description: 'Rice', gstRate: 0, category: 'Food', examples: 'Paddy rice, husked rice, semi-milled rice, parboiled rice, broken rice' },
  { code: '0901', description: 'Coffee, whether or not roasted or decaffeinated', gstRate: 5, category: 'Food', examples: 'Green coffee beans, roasted coffee, instant coffee powder' },
  { code: '0902', description: 'Tea, whether or not flavoured', gstRate: 5, category: 'Food', examples: 'CTC tea, orthodox tea, green tea, herbal tea blends' },
  { code: '0904', description: 'Pepper of the genus Piper; dried or crushed or ground fruits of the genus Capsicum', gstRate: 5, category: 'Food / Spices', examples: 'Black pepper, white pepper, red chilli, paprika, dried green chilli' },
  { code: '1701', description: 'Cane or beet sugar and chemically pure sucrose, in solid form', gstRate: 5, category: 'Food', examples: 'Refined sugar (M30, S30), raw sugar, plantation white sugar' },
  // Pharma
  { code: '3004', description: 'Medicaments (excluding goods of heading 3002, 3005 or 3006)', gstRate: 12, category: 'Pharmaceuticals', examples: 'Finished drug formulations, tablets, capsules, injections, syrups' },
  { code: '3002', description: 'Human or animal blood; antisera; vaccines; toxins; cultures of micro-organisms', gstRate: 5, category: 'Pharmaceuticals', examples: 'Vaccines, blood plasma, antisera, diagnostics, probiotics' },
  // Auto
  { code: '8708', description: 'Parts and accessories of the motor vehicles of headings 8701 to 8705', gstRate: 28, category: 'Automotive', examples: 'Auto parts (bumpers, body parts, brakes, clutches, steering components)' },
  { code: '4011', description: 'New pneumatic tyres, of rubber', gstRate: 28, category: 'Automotive', examples: 'Car tyres, truck tyres, two-wheeler tyres, tractor tyres' },
  { code: '8507', description: 'Electric accumulators, including separators therefor', gstRate: 28, category: 'Automotive', examples: 'Lead-acid batteries, lithium-ion batteries, inverter batteries' },
  // Construction
  { code: '2523', description: 'Portland cement, aluminous cement, slag cement, supersulphate cement', gstRate: 28, category: 'Construction', examples: 'OPC cement, PPC cement, PSC cement, white cement, sulphate-resistant cement' },
  { code: '6810', description: 'Articles of cement, concrete or artificial stone', gstRate: 18, category: 'Construction', examples: 'Concrete blocks, paving slabs, precast elements, cement boards, kerbs' },
  { code: '6907', description: 'Ceramic flags and paving, hearth or wall tiles; mosaic cubes', gstRate: 18, category: 'Construction', examples: 'Floor tiles, wall tiles, vitrified tiles, ceramic tiles, mosaic' },
  { code: '3005', description: 'Wadding, gauze, bandages and similar articles', gstRate: 12, category: 'Healthcare', examples: 'Medical bandages, gauze rolls, surgical cotton, wound dressings' },
  { code: '9018', description: 'Instruments and appliances used in medical, surgical, dental or veterinary sciences', gstRate: 12, category: 'Healthcare', examples: 'Syringes, needles, catheters, blood pressure monitors, stethoscopes' },
  // Safety
  { code: '6211', description: 'Track suits, ski suits and swimwear; other garments', gstRate: 12, category: 'Safety Equipment', examples: 'Safety jackets, hi-visibility vests, coveralls, chemical protective suits' },
  { code: '6506', description: 'Other headgear, whether or not lined or trimmed', gstRate: 18, category: 'Safety Equipment', examples: 'Safety helmets, hard hats, bump caps' },
  { code: '9020', description: 'Other breathing appliances and gas masks', gstRate: 18, category: 'Safety Equipment', examples: 'Gas masks, respirators, air purifying respirators, SCBA' },
];

export function searchHSN(query: string): HSNCode[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return HSN_CODES.filter(h =>
    h.code.startsWith(q) ||
    h.description.toLowerCase().includes(q) ||
    h.examples.toLowerCase().includes(q) ||
    h.category.toLowerCase().includes(q)
  ).slice(0, 20);
}

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const COMMON_GST_ITEMS = [
  { name: 'Steel / Metals', rate: 18 },
  { name: 'Corrugated Boxes / Packaging', rate: 12 },
  { name: 'Plastic / Rubber Products', rate: 18 },
  { name: 'Chemicals / Adhesives', rate: 18 },
  { name: 'Textiles / Fabric', rate: 5 },
  { name: 'Food / Agricultural Commodities', rate: 0 },
  { name: 'Pharmaceuticals', rate: 12 },
  { name: 'Automotive Parts', rate: 28 },
  { name: 'Construction Materials (Cement)', rate: 28 },
  { name: 'Tiles / Ceramics', rate: 18 },
  { name: 'Electrical Equipment', rate: 18 },
  { name: 'Industrial Machinery', rate: 12 },
  { name: 'Pumps / Compressors', rate: 12 },
  { name: 'Safety Equipment', rate: 18 },
];
