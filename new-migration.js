const axios = require('axios');
const axiosThrottle = require('axios-request-throttle');
const axiosRetry = require('axios-retry');
const fs = require('node:fs/promises');
const riskMap = require('./risk-map');
const mapDecisionDate = require('./migrate-decision-date');
const mapRisk = require('./migrate-risk');
const mapOddDate = require('./migrate-odd');

const PRODUCTION_API_KEY = 123;
const REQUESTS_PER_SECOND = 2;

const axiosInstance = axios.create({
  baseURL: 'https://app.startdeliver.com/api/v1',
  headers: { Authorization: PRODUCTION_API_KEY, },
});
axiosThrottle.use(axiosInstance, { requestsPerSecond: REQUESTS_PER_SECOND })

axiosRetry(axiosInstance, {
  retries: 3,
  retryCondition: error => (
    error?.code === 'ETIMEDOUT'
    || axiosRetry.isNetworkOrIdempotentRequestError(error)
    || error?.response?.status === 429
  ),
  onRetry: (retryCount, error, requestConfig) => {
    console.error(`Retrying request to ${requestConfig.baseURL}${requestConfig.url} for the ${retryCount} time due to: \n ${error}`);
  },
  retryDelay: () => 1000 * 30,
  shouldResetTimeout: true,
});

async function migrateOnboardingLogFields(applications) {
  const nonExistentCorporationsIds = [];
  for (const intergiroId in applications) {
    const applicationToStartdeliver = { 
      customfieldIntergiroId: intergiroId,
      ...applications[intergiroId]
    }
    console.log(applicationToStartdeliver);
    try {
      const { data: { result } } = await axiosInstance({
        url: `/customer?customfieldIntergiroId=${encodeURIComponent(intergiroId)}`,
      },
      );
      if (result.length === 0) {
        console.warn(`${intergiroId} has not a correspondent customer in Startdeliver.`)
        nonExistentCorporationsIds.push(intergiroId);
        continue
      }
      const startdeliverId = result[0].id;
      await axiosInstance({
        url: `/customer/${startdeliverId}`,
        method: 'patch',
        data: applicationToStartdeliver,
      })
      console.log(`Corporation ${intergiroId} updated`)
    } catch (e) {
      console.error(e, applications[intergiroId]);
    }
  }
  if (nonExistentCorporationsIds.length > 0) {
    const jsonData = JSON.stringify(nonExistentCorporationsIds);
    await fs.writeFile('missing-corporations.json', jsonData);
  }
}

async function readJson(
decisionDatePath = './decision_mock.json',
riskPath = './risk_mock.json',
oddDatePath = './odd_mock.json') {
  const decisionDates = await fs.readFile(decisionDatePath);
  decisionDateAplications = mapDecisionDate(JSON.parse(decisionDates))
  await migrateOnboardingLogFields(decisionDateAplications);
  const riskData = await fs.readFile(riskPath);
  const riskApplications = mapRisk(JSON.parse(riskData));
  await migrateOnboardingLogFields(riskApplications);
  const oddDateData = await fs.readFile(oddDatePath);
  const oddApplications = mapOddDate(JSON.parse(oddDateData))
  await migrateOnboardingLogFields(oddApplications);
}

readJson().then();