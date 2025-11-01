import { Conversation } from '@/lib/conversations-data';
import * as yaml from 'js-yaml';
import citiesConversationYaml from './citiesCsConversation.yaml';

export const citiesCsConversation = yaml.load(citiesConversationYaml) as Conversation;
