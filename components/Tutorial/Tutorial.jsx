/* eslint-disable max-len */
import { Modal, Collapse } from 'antd';

const { Panel } = Collapse;

function Tutorial({ showTutorial, setShowTutorial }) {
    return (
        <div>
            <Modal open={showTutorial} title="Tutorials" footer={null} centered closable onCancel={() => setShowTutorial(false)}>
                <div style={{ display: 'flex', flexFlow: 'column', gap: '1rem' }}>
                    <div>
                        <Collapse>
                            <Panel header="Generating a Code">
                                <div style={{ height: '36rem' }}>
                                    <iframe style={{ overflow: 'hidden', width: '100%', height: '100%' }} src="https://scribehow.com/embed/How_to_Generate_QR_Codes_using_Supply_Mate__jHwsiraBR7epHIinTZysdw?skipIntro=true" title="test" frameborder="0" />
                                </div>
                            </Panel>
                        </Collapse>
                    </div>
                    <div>
                        <Collapse>
                            <Panel header="Adding a Contact">
                                <div style={{ height: '36rem' }}>
                                    <iframe style={{ overflow: 'hidden', width: '100%', height: '100%' }} src="https://scribehow.com/embed/Adding_a_Contact_for_Notifications__nyj_GtSBRmCiY5TlY22cEA?skipIntro=true" title="test" frameborder="0" />
                                </div>
                            </Panel>
                        </Collapse>
                    </div>
                    <div>
                        <Collapse>
                            <Panel header="Choose/Manage a Plan">
                                <div style={{ height: '36rem' }}>
                                    <iframe style={{ overflow: 'hidden', width: '100%', height: '100%' }} src="https://scribehow.com/embed/How_to_Upgrade_or_Change_Plan__HR-1Y9DNRnKtA8i83ire7Q?skipIntro=true" title="test" frameborder="0" />
                                </div>
                            </Panel>
                        </Collapse>
                    </div>
                    <div>
                        <Collapse>
                            <Panel header="Allow Requestor To Text You Directly">
                                <div style={{ height: '36rem' }}>
                                    <iframe style={{ overflow: 'hidden', width: '100%', height: '100%' }} src="https://scribehow.com/embed/Allow_Requestors_to_Text_You_Directly___y1NLps5QKK3lMDbUGMoxA?skipIntro=true" title="test" frameborder="0" />
                                </div>
                            </Panel>
                        </Collapse>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Tutorial;
