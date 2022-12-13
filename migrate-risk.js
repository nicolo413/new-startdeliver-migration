const riskMap = require('./risk-map');

function mapRisk(riskData) {
  const processedApplications = {}
  for (const application of riskData) {
    const { 'Corporation ID': corporationId, 'Applications View - Risk': risk } = application;
    console.log(corporationId, risk);
    const riskLevel = riskMap[risk];
    if (processedApplications[corporationId]) {
        if (riskLevel > processedApplications?.[corporationId].riskLevel) {
          processedApplications[corporationId] = {
            riskLevel,
            customfieldRiskScore: risk, 
          }
        }

      continue;
    }
    processedApplications[corporationId] = { 
      customfieldRiskScore: risk,
      riskLevel,
    }
  }
  for (applicationId in processedApplications) {
    delete processedApplications[applicationId].riskLevel;
  }
  console.log(processedApplications);

  return processedApplications;
}

module.exports = mapRisk;