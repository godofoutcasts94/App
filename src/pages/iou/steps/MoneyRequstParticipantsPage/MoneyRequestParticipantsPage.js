import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import MoneyRequestParticipantsSelector from './MoneyRequestParticipantsSelector';
import styles from '../../../../styles/styles';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import compose from '../../../../libs/compose';
import * as DeviceCapabilities from '../../../../libs/DeviceCapabilities';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import * as IOU from '../../../../libs/actions/IOU';
import participantPropTypes from '../../../../components/participantPropTypes';

const propTypes = {
    /** React Navigation route */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: PropTypes.shape({
        /** ID (iouType + reportID) of the request */
        id: PropTypes.string,

        /** Amount of the request */
        amount: PropTypes.number,

        /** List of the participants */
        participants: PropTypes.arrayOf(participantPropTypes),
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iou: {
        id: '',
        amount: 0,
        participants: [],
    },
};

function MoneyRequestParticipantsPage({iou, translate, route}) {
    const iouType = useRef(lodashGet(route, 'params.iouType', ''));
    const reportID = useRef(lodashGet(route, 'params.reportID', ''));
    const [headerTitle, setHeaderTitle] = useState();

    useEffect(() => {
        setHeaderTitle(_.isEmpty(iou.participants) ? translate('tabSelector.manual') : translate('iou.split'));
    }, [iou.participants, translate]);

    const navigateToNextStep = (moneyRequestType) => {
        IOU.setMoneyRequestId(moneyRequestType);
        Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(moneyRequestType, reportID.current));
    };

    const navigateBack = (forceFallback = false) => {
        Navigation.goBack(ROUTES.getMoneyRequestRoute(iouType.current, reportID.current), forceFallback);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight={DeviceCapabilities.canUseTouchScreen()}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <View style={styles.flex1}>
                    <HeaderWithBackButton
                        title={headerTitle}
                        onBackButtonPress={navigateBack}
                    />
                    <MoneyRequestParticipantsSelector
                        participants={iou.participants}
                        onAddParticipants={IOU.setMoneyRequestParticipants}
                        navigateToRequest={() => navigateToNextStep(CONST.IOU.MONEY_REQUEST_TYPE.REQUEST)}
                        navigateToSplit={() => navigateToNextStep(CONST.IOU.MONEY_REQUEST_TYPE.SPLIT)}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

MoneyRequestParticipantsPage.displayName = 'IOUParticipantsPage';
MoneyRequestParticipantsPage.propTypes = propTypes;
MoneyRequestParticipantsPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        iou: {key: ONYXKEYS.IOU},
    }),
)(MoneyRequestParticipantsPage);
