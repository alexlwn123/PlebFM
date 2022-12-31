import { NextApiRequest, NextApiResponse } from "next";
import Customers from "../../../models/Customer";
import Users from "../../../models/User";
import Instances, { Instance } from "../../../models/Instance";
import { Bid } from "../../../models/Bid";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      console.error(req.body);
      const { customerName, userId, rHash, songId, bidAmount } = req.body;
      const now: string = Date.now().toString();
      const user = await Users.findOne({ userId: userId });

      const newBid: Bid = {
        user: user,
        bidAmount: bidAmount,
        timestamp: now,
        rHash: rHash,
      }
      console.error(req.body)

      const customer = await Customers.findOne({ shortName: customerName });
      if (!customer) return res.status(400).json({ success: false, error: `Customer not found.` });
      console.error(customer)

      // const user = await Users.findOne({ userId: userId });
      // if (!user) return res.status(400).json({ success: false, error: 'User not found.' });
      // console.error(user)

      const reusedBidInstance = await Instances.findOne({ "bids.rHash": { $eq: rHash } })
      if (reusedBidInstance) return res.status(400).json({ success: false, error: 'Duplicate bid found.' });
      console.error(reusedBidInstance);

      const existingInstance = await Instances.findOne({ songId: songId });

      // Boost existing Instance
      if (existingInstance) {
        const instance = await Instances.findOneAndUpdate({ songId: songId }, { $push: { bids: newBid }, $inc: { runningTotal: bidAmount } }).catch(_ => {});
        return res.status(200).json({ success: true, new: false, instance: instance });

      // New Instance
      } else {
        const newInstance: Instance = {
          customerId: customer.id,
          songId: songId,
          status: "queued",
          queueTimestamp: now,
          bids: new Array<Bid>(newBid),
          runningTotal: bidAmount
        };
        await Instances.create(newInstance).catch(_ => console.error('Add Instance Failed'));
        return res.status(200).json({ success: true, new: true, instance: newInstance });
      }
    }

  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export default handler;
