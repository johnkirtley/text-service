import { Modal, Collapse } from 'antd';

const { Panel } = Collapse;

function Tutorial({ showTutorial, setShowTutorial }) {
    return (
        <div>
            <Modal open={showTutorial} title="Quick Walkthroughs..." footer={null} centered closable onCancel={() => setShowTutorial(false)}>
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
                                    <iframe style={{ overflow: 'hidden', width: '100%', height: '100%' }} src="https://scribehow.com/embed/Add_and_Remove_Contacts_in_Localhost_Settings__XajLvzpZQHG7DE-E47FdFA?skipIntro=true" title="test" frameborder="0" />
                                </div>
                            </Panel>
                        </Collapse>
                    </div>
                    <div>
                        <Collapse>
                            <Panel header="Choose/Manage a Plan">
                                <div style={{ height: '36rem' }}>
                                    <iframe style={{ overflow: 'hidden', width: '100%', height: '100%' }} src="https://scribehow.com/embed/Selecting_Silver_Plan_for_Localhost_Site__7gyFnbOoTQekey9tidIYXg?skipIntro=true" title="test" frameborder="0" />
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
