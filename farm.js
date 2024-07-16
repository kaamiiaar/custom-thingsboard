class Farm {
    constructor(sets, irrig_info) {
        this.sets = sets;
        this.irrig_info = irrig_info;
        this.custom_irrig_info = irrig_info;

        this.auto_irrig = false;
        this.fromRelations = ['c1fa-set1', 'c1fa-set2', 'c1fa-set3', 'c1fa-set4', 'c1fa-set5', 'c1fa-set6', 'c1fa-set7', 'c1fa-set8', 'c1fa-set9', 'c1fa-set10', 'c1fa-set11', 'c1fa-set12', 'c1fa-set13', 'c1fa-set14'];
    }

    onClickStartIrrigation(tb_pe) {
        let msg = {
            "auto_irrig": true
        };
        let metadata = {'originatorName': this};
        let msgType = 'ATTRIBUTES_UPDATED';
        console.log(`*** Farm onClickStartIrrigation triggered with message: ${JSON.stringify(msg)}`);
        tb_pe.farmRuleChain(msg, metadata, msgType);
    }
}

module.exports = Farm;
