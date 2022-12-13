function mapOddDate(decisionDateData) {
  const processedApplications = {};
  for (const application of decisionDateData) {
    const { 'Corporation ID': corporationId } = application;
    console.log(corporationId);
    console.log(application);
    if (processedApplications?.[corporationId]) {
      application['Applications View - Next Odd'] >= processedApplications[corporationId].customfieldNexOddAt ?
        processedApplications[corporationId].customfieldNexOddAt = application['Applications View - Next Odd']
        : null;

      continue;
    }
    processedApplications[corporationId] = { customfieldNexOddAt: application['Applications View - Next Odd'] }
  }

  return processedApplications;
}

module.exports = mapOddDate;