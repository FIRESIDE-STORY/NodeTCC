const Models = require('../lib/support/models');
const DTC = require('./transaction_coordinator');
const { DRM } = require('./resource_manager');

DRM.setModels(Models);

describe('transaction_coordinator', () => {
  const dtc = new DTC();

  it('branch', async () => {
    await dtc.start(Models.firstDemo);

    expect(dtc._branches.length).toBe(1);
    const branch = await dtc._branches[0];

    expect(branch.options.tccName).toBe('branch');
    expect(branch.options.openTcc).toBe(true);
  });

  it('getBranches', async () => {
    const branches = await dtc.getBranches(Models.firstDemo);

    expect(branches.length).toBe(1);
    expect(branches[0].options.tccName).toBe('branch');
    expect(branches[0].options.openTcc).toBe(true);
  });
});
