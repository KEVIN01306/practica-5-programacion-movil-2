import type {
    ContentFieldEntity,
    CreateContentFieldInput,
    UpdateContentFieldInput,
} from "./content-field.entity.js";

export interface ContentFieldsRepository {
    create(data: CreateContentFieldInput): Promise<ContentFieldEntity>;
    findById(id: string): Promise<ContentFieldEntity | null>;
    findByKey(contentTypeId: string, key: string): Promise<ContentFieldEntity | null>;
    listByContentType(contentTypeId: string): Promise<ContentFieldEntity[]>;
    update(id: string, data: UpdateContentFieldInput): Promise<ContentFieldEntity>;
    delete(id: string): Promise<void>;
    countByContentType(contentTypeId: string): Promise<number>;
}
