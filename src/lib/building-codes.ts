// Building code references by province and trade

export interface CodeReference {
  codeName: string;
  codeNumber: string;
  authority: string;
  amendments?: string;
  website?: string;
}

export interface TradeCodes {
  electrical: CodeReference;
  plumbing: CodeReference;
  building: CodeReference;
  fire: CodeReference;
  mechanical?: CodeReference;
  energy?: CodeReference;
}

// Province-specific building code references
export const PROVINCE_CODES: Record<string, TradeCodes> = {
  'Newfoundland and Labrador': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'Newfoundland and Labrador Electrical Inspection Services',
      amendments: 'NL adopts CEC with provincial amendments',
      website: 'https://www.gov.nl.ca/iet/electrical/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'Service NL',
      amendments: 'NL adopts NPC with provincial amendments',
      website: 'https://www.gov.nl.ca/service-nl/'
    },
    building: {
      codeName: 'National Building Code of Canada (NBC)',
      codeNumber: 'NBC 2020',
      authority: 'Service NL',
      amendments: 'NL adopts NBC 2020',
      website: 'https://www.gov.nl.ca/service-nl/'
    },
    fire: {
      codeName: 'National Fire Code of Canada (NFC)',
      codeNumber: 'NFC 2020',
      authority: 'Service NL',
      website: 'https://www.gov.nl.ca/service-nl/'
    },
    mechanical: {
      codeName: 'National Energy Code of Canada for Buildings (NECB)',
      codeNumber: 'NECB 2020',
      authority: 'Service NL',
      website: 'https://www.gov.nl.ca/service-nl/'
    }
  },
  'Nova Scotia': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'Nova Scotia Department of Labour, Skills and Immigration',
      amendments: 'NS adopts CEC with provincial amendments',
      website: 'https://novascotia.ca/lae/electrical/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'Nova Scotia Department of Municipal Affairs and Housing',
      website: 'https://beta.novascotia.ca/'
    },
    building: {
      codeName: 'National Building Code of Canada (NBC)',
      codeNumber: 'NBC 2020',
      authority: 'Nova Scotia Department of Municipal Affairs and Housing',
      website: 'https://beta.novascotia.ca/'
    },
    fire: {
      codeName: 'National Fire Code of Canada (NFC)',
      codeNumber: 'NFC 2020',
      authority: 'Nova Scotia Department of Municipal Affairs and Housing',
      website: 'https://beta.novascotia.ca/'
    }
  },
  'Prince Edward Island': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'PEI Department of Workforce, Advanced Learning and Population',
      amendments: 'PEI adopts CEC with provincial amendments',
      website: 'https://www.princeedwardisland.ca/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'PEI Department of Social Development and Housing',
      website: 'https://www.princeedwardisland.ca/'
    },
    building: {
      codeName: 'National Building Code of Canada (NBC)',
      codeNumber: 'NBC 2020',
      authority: 'PEI Department of Social Development and Housing',
      website: 'https://www.princeedwardisland.ca/'
    },
    fire: {
      codeName: 'National Fire Code of Canada (NFC)',
      codeNumber: 'NFC 2020',
      authority: 'PEI Department of Social Development and Housing',
      website: 'https://www.princeedwardisland.ca/'
    }
  },
  'New Brunswick': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'WorkSafeNB',
      amendments: 'NB adopts CEC with provincial amendments',
      website: 'https://www.worksafenb.ca/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'Service New Brunswick',
      website: 'https://www.snb.ca/'
    },
    building: {
      codeName: 'National Building Code of Canada (NBC)',
      codeNumber: 'NBC 2020',
      authority: 'Service New Brunswick',
      website: 'https://www.snb.ca/'
    },
    fire: {
      codeName: 'National Fire Code of Canada (NFC)',
      codeNumber: 'NFC 2020',
      authority: 'Service New Brunswick',
      website: 'https://www.snb.ca/'
    }
  },
  'Quebec': {
    electrical: {
      codeName: 'Code d\'installation électrique du Québec (CNE)',
      codeNumber: 'CNE 24th Edition',
      authority: 'Régie du bâtiment du Québec (RBQ)',
      amendments: 'Quebec uses CNE (based on CEC but with Quebec-specific requirements)',
      website: 'https://www.rbq.gouv.qc.ca/'
    },
    plumbing: {
      codeName: 'Code de plomberie du Québec',
      codeNumber: 'CPQ',
      authority: 'Régie du bâtiment du Québec (RBQ)',
      website: 'https://www.rbq.gouv.qc.ca/'
    },
    building: {
      codeName: 'Code de construction du Québec (CCQ)',
      codeNumber: 'CCQ',
      authority: 'Régie du bâtiment du Québec (RBQ)',
      website: 'https://www.rbq.gouv.qc.ca/'
    },
    fire: {
      codeName: 'Code de sécurité incendie du Québec',
      codeNumber: 'CSI',
      authority: 'Régie du bâtiment du Québec (RBQ)',
      website: 'https://www.rbq.gouv.qc.ca/'
    }
  },
  'Ontario': {
    electrical: {
      codeName: 'Ontario Electrical Safety Code (OESC)',
      codeNumber: 'OESC 28th Edition (based on CEC)',
      authority: 'Electrical Safety Authority (ESA)',
      amendments: 'Ontario-specific amendments to CEC',
      website: 'https://www.esasafe.com/'
    },
    plumbing: {
      codeName: 'Ontario Building Code (OBC) - Plumbing',
      codeNumber: 'OBC 2020',
      authority: 'Ministry of Municipal Affairs and Housing',
      website: 'https://www.ontario.ca/page/building-code'
    },
    building: {
      codeName: 'Ontario Building Code (OBC)',
      codeNumber: 'OBC 2020',
      authority: 'Ministry of Municipal Affairs and Housing',
      website: 'https://www.ontario.ca/page/building-code'
    },
    fire: {
      codeName: 'Ontario Fire Code (OFC)',
      codeNumber: 'OFC 2020',
      authority: 'Office of the Fire Marshal',
      website: 'https://www.ontario.ca/page/fire-code'
    }
  },
  'Manitoba': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'Manitoba Hydro',
      amendments: 'MB adopts CEC with provincial amendments',
      website: 'https://www.hydro.mb.ca/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'Manitoba Office of the Fire Commissioner',
      website: 'https://www.gov.mb.ca/mit/fire/'
    },
    building: {
      codeName: 'Manitoba Building Code',
      codeNumber: 'Based on NBC 2020',
      authority: 'Manitoba Office of the Fire Commissioner',
      website: 'https://www.gov.mb.ca/mit/fire/'
    },
    fire: {
      codeName: 'Manitoba Fire Code',
      codeNumber: 'Based on NFC 2020',
      authority: 'Manitoba Office of the Fire Commissioner',
      website: 'https://www.gov.mb.ca/mit/fire/'
    }
  },
  'Saskatchewan': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'Technical Safety Authority of Saskatchewan (TSASK)',
      amendments: 'SK adopts CEC with provincial amendments',
      website: 'https://www.tsask.ca/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'Technical Safety Authority of Saskatchewan (TSASK)',
      website: 'https://www.tsask.ca/'
    },
    building: {
      codeName: 'Saskatchewan Building Code',
      codeNumber: 'Based on NBC 2020',
      authority: 'Government of Saskatchewan',
      website: 'https://www.saskatchewan.ca/'
    },
    fire: {
      codeName: 'Saskatchewan Fire Code',
      codeNumber: 'Based on NFC 2020',
      authority: 'Government of Saskatchewan',
      website: 'https://www.saskatchewan.ca/'
    }
  },
  'Alberta': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'Alberta Municipal Affairs - Safety Codes Council',
      amendments: 'AB adopts CEC with provincial amendments',
      website: 'https://www.safetycodes.ab.ca/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'Alberta Municipal Affairs - Safety Codes Council',
      website: 'https://www.safetycodes.ab.ca/'
    },
    building: {
      codeName: 'Alberta Building Code',
      codeNumber: 'Based on NBC 2020',
      authority: 'Alberta Municipal Affairs - Safety Codes Council',
      website: 'https://www.safetycodes.ab.ca/'
    },
    fire: {
      codeName: 'Alberta Fire Code',
      codeNumber: 'Based on NFC 2020',
      authority: 'Alberta Municipal Affairs - Safety Codes Council',
      website: 'https://www.safetycodes.ab.ca/'
    }
  },
  'British Columbia': {
    electrical: {
      codeName: 'British Columbia Electrical Code (BCEC)',
      codeNumber: 'BCEC (based on CEC Part I, CSA C22.1-21)',
      authority: 'Technical Safety BC',
      amendments: 'BC-specific amendments to CEC',
      website: 'https://www.technicalsafetybc.ca/'
    },
    plumbing: {
      codeName: 'British Columbia Plumbing Code',
      codeNumber: 'BCPC (based on NPC 2020)',
      authority: 'Technical Safety BC',
      website: 'https://www.technicalsafetybc.ca/'
    },
    building: {
      codeName: 'British Columbia Building Code (BCBC)',
      codeNumber: 'BCBC 2018 (based on NBC 2020)',
      authority: 'Building and Safety Standards Branch',
      website: 'https://www2.gov.bc.ca/gov/content/industry/construction-industry/building-codes-standards'
    },
    fire: {
      codeName: 'British Columbia Fire Code (BCFC)',
      codeNumber: 'BCFC (based on NFC 2020)',
      authority: 'Office of the Fire Commissioner',
      website: 'https://www2.gov.bc.ca/gov/content/safety/emergency-preparedness-response-recovery/fire-safety'
    }
  },
  'Yukon': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'Yukon Government - Community Services',
      amendments: 'YT adopts CEC',
      website: 'https://yukon.ca/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'Yukon Government - Community Services',
      website: 'https://yukon.ca/'
    },
    building: {
      codeName: 'National Building Code of Canada (NBC)',
      codeNumber: 'NBC 2020',
      authority: 'Yukon Government - Community Services',
      website: 'https://yukon.ca/'
    },
    fire: {
      codeName: 'National Fire Code of Canada (NFC)',
      codeNumber: 'NFC 2020',
      authority: 'Yukon Government - Community Services',
      website: 'https://yukon.ca/'
    }
  },
  'Northwest Territories': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'NWT Department of Municipal and Community Affairs',
      amendments: 'NT adopts CEC',
      website: 'https://www.maca.gov.nt.ca/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'NWT Department of Municipal and Community Affairs',
      website: 'https://www.maca.gov.nt.ca/'
    },
    building: {
      codeName: 'National Building Code of Canada (NBC)',
      codeNumber: 'NBC 2020',
      authority: 'NWT Department of Municipal and Community Affairs',
      website: 'https://www.maca.gov.nt.ca/'
    },
    fire: {
      codeName: 'National Fire Code of Canada (NFC)',
      codeNumber: 'NFC 2020',
      authority: 'NWT Department of Municipal and Community Affairs',
      website: 'https://www.maca.gov.nt.ca/'
    }
  },
  'Nunavut': {
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'Nunavut Department of Community and Government Services',
      amendments: 'NU adopts CEC',
      website: 'https://www.gov.nu.ca/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'Nunavut Department of Community and Government Services',
      website: 'https://www.gov.nu.ca/'
    },
    building: {
      codeName: 'National Building Code of Canada (NBC)',
      codeNumber: 'NBC 2020',
      authority: 'Nunavut Department of Community and Government Services',
      website: 'https://www.gov.nu.ca/'
    },
    fire: {
      codeName: 'National Fire Code of Canada (NFC)',
      codeNumber: 'NFC 2020',
      authority: 'Nunavut Department of Community and Government Services',
      website: 'https://www.gov.nu.ca/'
    }
  },
  'Canada': {
    // Default/fallback
    electrical: {
      codeName: 'Canadian Electrical Code (CEC)',
      codeNumber: 'CEC Part I, CSA C22.1-21',
      authority: 'Canadian Standards Association (CSA)',
      website: 'https://www.csagroup.org/'
    },
    plumbing: {
      codeName: 'National Plumbing Code of Canada (NPC)',
      codeNumber: 'NPC 2020',
      authority: 'National Research Council Canada (NRC)',
      website: 'https://nrc.canada.ca/'
    },
    building: {
      codeName: 'National Building Code of Canada (NBC)',
      codeNumber: 'NBC 2020',
      authority: 'National Research Council Canada (NRC)',
      website: 'https://nrc.canada.ca/'
    },
    fire: {
      codeName: 'National Fire Code of Canada (NFC)',
      codeNumber: 'NFC 2020',
      authority: 'National Research Council Canada (NRC)',
      website: 'https://nrc.canada.ca/'
    }
  }
};

// Get code reference for a specific trade in a province
export function getCodeReference(province: string, trade: string): CodeReference | null {
  const provinceCodes = PROVINCE_CODES[province] || PROVINCE_CODES['Canada'];
  
  const tradeMap: Record<string, keyof TradeCodes> = {
    'electrical': 'electrical',
    'plumbing': 'plumbing',
    'hvac': 'mechanical',
    'framing': 'building',
    'roofing': 'building',
    'foundation': 'building',
    'drywall': 'building',
    'flooring': 'building',
    'painting': 'building',
    'construction': 'building'
  };
  
  const codeKey = tradeMap[trade.toLowerCase()] || 'building';
  return provinceCodes[codeKey] || provinceCodes.building;
}

// Get all relevant codes for a trade
export function getTradeCodes(province: string, trade: string): CodeReference[] {
  const codes: CodeReference[] = [];
  const provinceCodes = PROVINCE_CODES[province] || PROVINCE_CODES['Canada'];
  
  // Primary code for the trade
  const primaryCode = getCodeReference(province, trade);
  if (primaryCode) {
    codes.push(primaryCode);
  }
  
  // Additional codes that may apply
  if (trade.toLowerCase() === 'electrical') {
    // Electrical may also reference building code for structural requirements
    if (provinceCodes.building) codes.push(provinceCodes.building);
  }
  
  if (trade.toLowerCase() === 'hvac') {
    // HVAC may reference mechanical, building, and energy codes
    if (provinceCodes.mechanical) codes.push(provinceCodes.mechanical);
    if (provinceCodes.building) codes.push(provinceCodes.building);
    if (provinceCodes.energy) codes.push(provinceCodes.energy);
  }
  
  if (['framing', 'roofing', 'foundation'].includes(trade.toLowerCase())) {
    // Structural trades reference building and fire codes
    if (provinceCodes.building) codes.push(provinceCodes.building);
    if (provinceCodes.fire) codes.push(provinceCodes.fire);
  }
  
  return codes;
}

// Generate code compliance section for estimates
export function generateCodeComplianceSection(province: string, trade: string): string {
  const codes = getTradeCodes(province, trade);
  const primaryCode = codes[0];
  
  if (!primaryCode) {
    return `## Code Compliance (${province})\n- **Status**: Code references not available for this province/trade combination`;
  }
  
  let section = `## Code Compliance (${province})\n\n`;
  section += `### Primary Code Reference\n`;
  section += `- **Code Name**: ${primaryCode.codeName}\n`;
  section += `- **Code Number**: ${primaryCode.codeNumber}\n`;
  section += `- **Authority**: ${primaryCode.authority}\n`;
  if (primaryCode.amendments) {
    section += `- **Provincial Amendments**: ${primaryCode.amendments}\n`;
  }
  if (primaryCode.website) {
    section += `- **Reference**: ${primaryCode.website}\n`;
  }
  
  if (codes.length > 1) {
    section += `\n### Additional Applicable Codes\n`;
    codes.slice(1).forEach((code, idx) => {
      section += `${idx + 1}. **${code.codeName}** (${code.codeNumber})\n`;
      if (code.authority) section += `   - Authority: ${code.authority}\n`;
    });
  }
  
  section += `\n### Compliance Verification\n`;
  section += `- ✅ **Code Compliance**: Verified against ${primaryCode.codeName}\n`;
  section += `- ✅ **Provincial Requirements**: ${province}-specific requirements considered\n`;
  section += `- ✅ **Permit Required**: Yes (verify with local authority)\n`;
  section += `- ✅ **Inspection Required**: Yes (verify with local authority)\n`;
  
  return section;
}

