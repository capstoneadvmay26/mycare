const MedicationLogModel = require('../models/medicationLog.model');

const markDoseAsTaken = async(req, res, next) => {
    try {
        const medicationLog = await MedicationLogModel.findById(req.params.id);

        if(!medicationLog) {
            return res.status(404).json({
                message: "Medication Log not found"
            })
        }

        medicationLog.status = "taken";
        medicationLog.takenAt = new Date();
        medicationLog.skippedAt = null;

        await medicationLog.save();

        return res.status(200).json({
            message: "Medication marked as taken",
            medicationLog
        });

    } catch (error) {
        next(error);
    }
}

const markDoseAsSkipped = async (req, res, next) => {
    try {
        const medicationLog = await MedicationLogModel.findById(req.params.id);

        if(!medicationLog) {
            return res.status(404).json({
                message: "Medication Log not found"
            });
        }

        medicationLog.status = "skipped";
        medicationLog.skippedAt = new Date();
        medicationLog.takenAt = null;
        
        await medicationLog.save();

        return res.status(200).json({
            message: "Medication marked as skipped",
            medicationLog
        })
    } catch (error) {
        next(error);
    }
}

module.exports = {
    markDoseAsTaken,
    markDoseAsSkipped
};