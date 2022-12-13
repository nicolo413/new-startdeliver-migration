function mapDecisionDate(decisionDateData) {
  const processedApplications = {};
  for (const application of decisionDateData) {
    const { 'Corporation ID': corporationId } = application;
    if (processedApplications?.[corporationId]) {
      application['Applications View - Processed'] >= processedApplications[corporationId].customfieldDecisionMadeAt ?
        processedApplications[corporationId].customfieldDecisionMadeAt = application['Applications View - Processed']
        : null;

      continue;
    }
    processedApplications[corporationId] = { customfieldDecisionMadeAt: application['Applications View - Processed'] }
  }
  return processedApplications;
}

module.exports = mapDecisionDate;